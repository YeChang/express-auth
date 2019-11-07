const { User } = require('./models')
const express = require('express')
const jwt = require('jsonwebtoken')


const app = express()
//生成token用，写在环境变量里
const SAULT = 'asdasdasddas'
app.use(express.json())



app.get('/api/users', async (req, res) => {
    const users = await User.find()
    res.send(users)
})

const auth = async (req, res, next) => {
    const raw = String(req.headers.authorization).
        split(' ').pop()
    // console.log(raw);
    // const tokenData = jwt.verify(raw, SAULT)
    // console.log(tokenData);
    //tokenData => { id: '5db872fb9c120033f439fe86', iat: 1572369929 }
    // 解构还是挺方便的  
    const { id } = jwt.verify(raw, SAULT)
    req.user = await User.findById(id)
    next()
}
app.get('/api/profile', auth, async (req, res) => {
    res.send(req.user)
})




app.post('/api/register', async (req, res) => {
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
    })
    // console.log(req.body);
    res.send(user)
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username
    })

    if (!user) {
        return res.status(422).send({
            message: '用户名不存在'
        })
    }
    const isPasswordValid = require('bcrypt-nodejs').compareSync(
        req.body.password,
        user.password
    )
    if (!isPasswordValid) {
        return res.status(422).send({
            message: '密码无效'
        })
    }
    //生成token
    const token = jwt.sign({
        id: String(user._id),

    }, SAULT)
    res.send({
        user,
        token: token
    })
})




app.listen(3001, () => {
    console.log('http://localhost:3001');
})