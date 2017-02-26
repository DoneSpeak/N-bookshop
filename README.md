# N-bookshop
简单的购书网站：http://www.donespeak.cn:3000

####1. 	项目简要说明
该网站为图解系列图书专卖店，销售的图书只有六本《图解HTTP》、《图解TCP/IP》、《图解机器学习》、《图解OpenFlow》、《图解密码技术》和《图解网站分析》。其中前四本书作为普通消费，《图解密码技术》和《图解网站分析》分别作为秒购图书和抢购图书。
####2.	前端设计
2.1 采用bootstrap前端框架，使得页面排版更加容易，排版更加容易好看。  
2.2 采用响应式，使得页面无论在怎样的设备上打开都保持良好的用户体验。  
2.3 根据销售的物品的特点采用更加合适的色彩字体设计。  
2.4 保持头部和脚步的一致性，使得页面设计统一协调，同时利用头部导航栏使得页面跳转更加容易以提高用户体验。  
####3．	注册登陆
3.1 用户需要注册账号并登录该网站才能进行该网站的商品购买，注册所需要的信息为用户名和密码。这里限制用户名唯一且长度为1-10，密码长度为6-16。  
3.2 登陆需要用户输入自己的用户名和密码以及显示的验证码，其中验证码不考虑大小写。如果验证码显示不清晰，需要允许用户刷新验证码。  
3.3 数据库保存用户信息时，需要对用户密码加密，以保证用户信息安全。  
3.4 用户在登录注册中输入了不符合要求信息时，需要有提醒，以保持良好的用户体验。  
3.5 将用户uid，用户名及用户名加密字段放到session中，其中uid是为了更加容易进行数据操作，用户名和用户名加密字段用于防止cookie攻击。   
3.6 session有效期为5个小时，也就是用户在登陆5小时后会字段登出。  
####4.	普通购物页面
4.1 合适的展示商品及商品信息，为每件商品提供可以加入购物车的按钮。  
4.2 实时显示购物车内商品的件数，让用户知道是否添加成功以及购物车中商品数。  
4.3 在库存中没有商品时，添加到购物车的按钮不可用，并显示缺货  
4.5 通过ajax实现添加商品，防止添加商品时刷新界面，以提供优良的用户体验。  
4.6 添加购物商品时考虑库存是否小于购物车的相应书本的数量，库存不足时需要有提示信息。  
####5.	抢购和秒购页面
5.1 非抢购时间不出现按钮，而现实提示信息。  
5.2 在相应的时间显示抢购商品和抢购按钮或者秒购商品和秒购按钮。  
5.3 其他后台的处理这里尚未实现。  
####6． 购物车页面
6.1 显示当前用户购物车内的所有商品及相关信息。用户可以删除减少、增加商品的数量或者直接删除一种商品。在操作商品数量时，商品的数量收库存数量约束，当商品的量多于库存数量时，会显示提示信息，并限制最大商品数在最大库存。  
6.2 每次操作商品数，需要实时在更新显示的购物车总数和计算总的价格。  
6.3 用户可以选择下单的商品，同时也提供全选功能。  
6.4 下单后如果因为库存不足而失败时需要显示提示信息。成功后直接跳转到付款页面进行付款，由于这里重点不是真的下单，所以跳过了填写收货地址的方式。  
####7.	付款页面。  
7.1 显示订单详情以及付款的二维码。  
7.2 付款成功后，如果还有订单尚未支付，则跳转回到订单也，否则回到购物车页。具体的付款方案此处尚未实现。  
7.3 放弃付款则将订单放回到订单页。  
7.4 取消订单，则会跳转回到订单页。具体的实现细节看8.订单列表页中介绍。  
####8.	订单列表页
8.1 显示用户所有的未付款未过期未取消的订单的订单详情（包含过期时间）。  
8.2 所有的订单必须在3小时内付款，否则会被作为过期处理掉。  
8.3 每次进入订单页时，后台会将该用户的未付款未取消已过期的订单释放掉，也就是将订单的图书放回到库存中，并将这些订单的转态设置为已经释放。  
8.4 用户取消订单，后台会将选中的订单进行释放，并不会再在订单页显示出来。  
8.5 这里为了保持导航栏的美观，我将订单页合并到了CUSTOMER选项中。同时订单也中会包含用户的个人信息和登出连接。  
####9.	CUSTOMER导航选项
9.1 用户已登录。定向到订单列表页。   
9.2 用户未登录。定向到登陆页面。  
