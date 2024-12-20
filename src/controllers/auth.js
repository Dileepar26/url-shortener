const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Database } = require('../utils/database');

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = "https://c889-3-82-244-196.ngrok-free.app/auth/google/callback"


const googleLogin = async (req, res) => {
    try {
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=${callbackURL}&response_type=code&scope=profile email`;
        res.redirect(url);
    } catch (err) {
        logger.error(err.stack);
        return res.status(500).json({
            success: false,
            message: `unknown error`
        })
    }
}

const googleRedirect = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Authorization code is missing.',
            });
        }

        const tokenURL = 'https://oauth2.googleapis.com/token';
        const userInfoURL = 'https://www.googleapis.com/oauth2/v1/userinfo';
        const { data } = await axios.post(tokenURL, {
            client_id: clientID,
            client_secret: clientSecret,
            code,
            redirect_uri: callbackURL,
            grant_type: 'authorization_code',
        });

        const { access_token } = data;
        const { data: userInfo } = await axios.get(userInfoURL, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        // console.log(userInfo);
        const { id, email, name, picture } = userInfo;
        const DB = new Database();
        const existingUser = await DB.query(`SELECT id, googleId, displayName, email, picture FROM users WHERE googleId = ?`,[id]);
        if (existingUser.length) {
            const token = jwt.sign({id: existingUser[0].id},process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '1h' });
            return res.status(200).json({
                success: true,
                message: 'Success',
                user: existingUser[0],
                token: token
            });
        } else {
            const query = await DB.query( `INSERT INTO users (googleId, displayName, email, picture) VALUES (?, ?, ?, ?)`, [id, name, email, picture]);
            const token = jwt.sign({id: query.inserId}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || '1h' })
            return res.status(200).json({
                success: true,
                message: 'Success',
                user: userInfo,
                token
            });
        }    
    } catch (error) {
        logger.error(error.stack);
        return res.status(500).json({
            success: false,
            message: 'Unknown error occurred.'
        });
    }
};

module.exports = {
    googleLogin,
    googleRedirect
}