### test    147  27

```
yarn add sequelize-cli sequelize mysql2

# 运行命令：
..\node_modules\.bin\sequelize init   //初始化
..\node_modules\.bin\sequelize model:create --name Users --attributes username:STRING   //创建Users表的js文件

..\node_modules\.bin\sequelize db:create   //创建数据库
..\node_modules\.bin\sequelize db:migrate  //导入

# 创建种子文件 - 创建测试数据
..\node_modules\.bin\sequelize seed:generate --name TestData  //创建TestData测试数据的js文件
..\node_modules\.bin\sequelize db:seed:all  //导入测试数据文件

```