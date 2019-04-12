const KoaRouter = require('koa-router')
const md5 = require('md5')
const Sequelize = require('sequelize')

const Models = require('../models')

const router = new KoaRouter()

// 留言列表接口
router.post('/Contents', async ctx => {
    let pageNo = Number(ctx.request.body.pageNo) || 1  //当前第几页
    let pageSize = Number(ctx.request.body.pageSize) || 2  //每页显示多少条
    let offset = (pageNo - 1) * pageSize  //偏移量

    let data = await Models.Contents.findAndCountAll({
        offset: offset,
        limit: pageSize, //每页显示多少条
        include: {
            model: Models.Users
        }
    })
    
    let res = data.rows.map(d => {
        return {
            id: d.id,
            title: d.title,
            content: d.content,
            user_id: d.user_id,
            username: d.User.username,
            created_at: d.createdAt,
            like_count: d.like_count,
            comment_count: d.comment_count
        }
    })

    ctx.body = {
        code: 0,
        count: data.count,
        pageSize,
        data: res
    }
})
//注册接口
router.post('/register', async ctx => {
    console.log(ctx.request.body);
    let username = ctx.request.body.username
    let password = ctx.request.body.password
    let repassword = ctx.request.body.repassword
    if(username == '' || password == '' || repassword == ""){
        return ctx.body = {
            code: 1,
            data: '',
            message: '用户名或密码不能为空'
        }
    }
    if(password != repassword){
        return ctx.body = {
            code: 1,
            data: '',
            message: '两次输入的密码不一致'
        }
    }
    let user = await Models.Users.findOne({
        where: {
            username
        }
    })
    if(user !== null){
        return ctx.body = {
            code: 3,
            data: '',
            message: '当前用户已被注册'
        }
    }
    let newUser = await Models.Users.build({
        username,
        password: md5(password)
    }).save()
    ctx.body = {
        code: 0,
        data: {
            id: newUser.get('id'),
            username: newUser.get('username')
        },
        message: '注册成功'
    }
})
// 登录接口
router.post(`/login`, async ctx => {
    let username = ctx.request.body.username
    let password = ctx.request.bodu.password

    let user = await Models.Users.findOne({
        where: {
            username
        }
    })
    if(! user ){
        return ctx.body = {
            code: 1,
            data: '该用户不存在'
        }
    }
    if(user.get('password') !== md5(ctx.request.body.password)){
        return ctx.body = {
            code: 0,
            data: '',
            message: '密码输入有误'
        }
    }
    //设置登录验证
    ctx.cookies.set('uid', user.get('id'), {
        httpOnly: false
    }) 
    ctx.body = {
        code: 0,
        data: {
            id: user.get('id'),
            username: user.get('username'),
        },
        message: '登录成功'
    }
})
//点赞接口
router.post(`/like`, async ctx => {
    let contentId = ctx.request.body.contentId
    let uid = ctx.request.body.uid
    //判断是否登录

    //获取当前被点赞的内容
    let content = await Models.Contents.findOne({
        where: {
            id: contentId,
            user_id: uid
        }
    })
    if(!content){
        return ctx.body = {
            code: 1,
            data: '',
            message: '没有对应的内容'
        }
    }
    //查询当前用户有没有点过赞
    let like = await Models.Likes.findOne({
        where: {
            [Sequelize.Op.and]: [
                { content_id: contentId },
                { user_id: uid },
            ]
        }
    })
    if(like){
        return ctx.body = {
            code: 3,
            data: '',
            message: '您已经点过赞了'
        }
    }
    //点赞+1
    content.set('like_count', content.get('like_count') + 1)
    await content.save()  //保存

    let likes = await Models.Likes.build({
        content_id: contentId,
        user_id: uid
    }).save()
    ctx.body = {
        code: 0,
        data: content,
        message: '点赞成功'
    }
})
module.exports = router