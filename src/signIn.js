const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const signIn = async (event) => {
    const { email, password } = JSON.parse(event.body);
    const header = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
    }
    
    // if email or password is missing, return 400
    if (!email || !password) {
        return {
            statusCode: 400,
            headers: header,
            body: JSON.stringify({
                error: 'Email and password are required'
            })
        };
    }

    //get all items from db
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'JwtUsersTable'
    };
    const {Items} = await dynamodb.scan(params).promise();

    const allEmails = Items.map((item) => item.email);
    console.log(allEmails)

    // if email is in allEmails
    const user = allEmails.includes(email) ? Items.find((item) => item.email === email && bcrypt.compare(item.password, password)) : null;

    //if user is null, return 400
    if (!user) {
        return {
            statusCode: 400,
            headers: header,
            body: JSON.stringify({
                error: 'Invalid email or password'
            })
        };
    }
    //if user is not null, create token and return 200
    else {
        const jwtSecret = process.env.SECRET? process.env.SECRET : "secret"
        const token = jwt.sign({
            email: user.email,
            id: user.id
        }, jwtSecret, {
            expiresIn: '1h'
        });
        return {
            statusCode: 200,
            headers: header,
            body: JSON.stringify({
                token: token, 
            })
        };
    }
}

module.exports = {
    handler: signIn
}
