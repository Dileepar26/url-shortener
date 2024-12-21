const axios = require('axios');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe("Test GET redirectUrl", () => {
    it("should return a mocked response", async () => {
        const alias = "brDdShio2";
        const mockResponse = { status: 200, data: { success: true } };

        // Mock axios.get
        const axiosStub = sinon.stub(axios, "get").resolves(mockResponse);

        const API = "http://localhost:3000/api";
        const response = await axios.get(`${API}/analytics/${alias}`);

        expect(response.status).to.equal(200);
        expect(response.data.success).to.equal(true);

        axiosStub.restore();
    }).timeout(10000);
});
