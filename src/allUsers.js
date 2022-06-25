const AWS = require('aws-sdk');

const allUsers = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'JwtUsersTable'
    };
    const {Items} = await dynamodb.scan(params).promise();
    const allEmails = Items.map((item) => item.email);
    return {
        statusCode: 200,
        body: JSON.stringify(allEmails)
    };
}

module.exports = {
    handler: allUsers
}