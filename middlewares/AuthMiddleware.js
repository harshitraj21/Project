const JWT = require('jsonwebtoken')

module.exports = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(" ")[1]    // A naming convention is followed in token which means a Bearer is there before the token, So we are accessing 2nd part.
        //Ex: BEARER XWBWJWKJXBFHW, second part is token

        //authMiddleware is essential for protecting other routes that require the user to be authenticated before accessing them.
        JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                return res.status(200).send({ message: 'Authentication has Failed', success: false })
            } else {
                req.body.userId = decode.id
                next()
            }
        })
    } catch (error) {
        console.log(error)
        res.status(401).send({ message: 'Authentication has Failed', success: false })
    }
}