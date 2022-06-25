const bcrypt = require('bcryptjs');
const {v4} = require('uuid');
const AWS = require('aws-sdk');

const signUp = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    let { email, password } = JSON.parse(event.body);
    
    // if email or password is missing, return 400
    if (!email || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Email and password are required'
            })
        };
    }

    //get all items from db
    const params = {
        TableName: 'JwtUsersTable'
    };

    const {Items} = await dynamodb.scan(params).promise();
    const allEmails = Items.map((item) => item.email);
    
    // if email already exists, return 400
    if (allEmails.includes(email)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Email already exists'
            })
        };
    }

    // password is invalid
    if (password.length < 8) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Password must be at least 8 characters long'
            })
        };
    }
    //check if email is valid
    if(!email.includes('@') && !email.includes('.')){
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Email is invalid'
            })
        };
    }
    // valid password so hash it and save it to dynamodb
    else {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const id = v4();
        const params = {
            TableName: 'JwtUsersTable',
            Item: {
                id,
                email,
                passwordHash
            }
        };
        await dynamodb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                id,
                email
            })
        };
      }
}

module.exports={
    handler: signUp
}