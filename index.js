const http = require('http');
const fs = require('fs');
const path = require('path');
// 导入解析数据模块
const querystring = require('querystring');
// 导入url
const url = require('url');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
});
const server = http.createServer((request, response) => {
    let reqURL = request.url;
    //请求方式
    const reqMethod = request.method;
    // 请求路径（接口) list 
    if (reqURL === '/list' && reqMethod === 'GET') {
        // 查询所有数据
        const sql = `select * from picture where isDelete=1 order by id desc limit 0,20`

        connection.query(sql, (error, results, fields) => {
            if (error) throw error;
            const str = JSON.stringify(results);
            response.end(str);
        });
    } else if (reqURL.indexOf('/detailOnce') != -1 && reqMethod === 'GET') {
        // 获取url中的ID
        const detailId=url.parse(reqURL,true).query.id;
        console.log(detailId);
        
        // 查询某一条数据
        const detailSql = `select * from picture where id=${detailId} and isDelete=1`
        connection.query(detailSql, (error, results, fields) => {
            if (error) throw error;
            const str = JSON.stringify(results[0]);
            response.end(str);
        });
    }
    // 新增数据
    else if (reqURL === '/addPic' && reqMethod === 'POST') {
        let str = '';
        // 接收数据
        request.on('data', data => {
            str += data;
        })
        // 数据接收完毕
        request.on('end', () => {
            // console.log(str);

            // 解析数据 querystring
            const postData = querystring.parse(str);
            console.log(postData);

            const addSql = `insert into picture (title,pic,isDelete) value('${postData.title}','${postData.pic}','1')`
            console.log(addSql);
            connection.query(addSql, (error, results, fields) => {
                if (error) throw error;
                response.end(JSON.stringify({
                    code: '200',
                    msg: '数据新增成功'
                }));
            });
        })
    }
    // 删除
    else if (reqURL.indexOf('/delete') != -1 && reqMethod === 'GET') {
        // 获取ID
        const deleteId = url.parse(reqURL, true).query.id;
        const delSql = `update picture set isDelete=0 where id=${deleteId}`
        connection.query(delSql, (error, results, fields) => {
            if (error) throw error;
            response.end(JSON.stringify({
                code: '200',
                msg: '数据删除成功'
            }));
        });
    } else {
        // 特殊处理跳转静态页面
        if(reqURL.indexOf('detail.html') !=-1){
            reqURL='detail.html'
        }

        fs.readFile(path.join(__dirname, 'views', reqURL), (err, data) => {
            if (!err) {
                response.end(data);
            } else {
                response.end(`
                <h1>404 Not Found</h1>
                <p>The requested URL ${reqURL} was not found on this server.</p>
                `)
            }
        })
    }

})

server.listen('3399', () => {
    console.log('start');
})