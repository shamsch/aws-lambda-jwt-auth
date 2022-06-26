const AWS = require('aws-sdk');

const allUsers = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const header = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
    }

    const params = {
        TableName: 'JwtUsersTable'
    };
    const {Items} = await dynamodb.scan(params).promise();
    const allEmails = Items.map((item) => item.email);
    return {
        statusCode: 200,
        headers: header,
        body: JSON.stringify(allEmails)
    };
}

module.exports = {
    handler: allUsers
}