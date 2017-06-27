/*
Navicat MySQL Data Transfer

Source Server         : MySQL
Source Server Version : 50717
Source Host           : localhost:3306
Source Database       : qldg

Target Server Type    : MYSQL
Target Server Version : 50717
File Encoding         : 65001

Date: 2017-06-27 14:58:16
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for auctions
-- ----------------------------
DROP TABLE IF EXISTS `auctions`;
CREATE TABLE `auctions` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `Date` datetime NOT NULL,
  `Price` int(11) NOT NULL,
  `UserID` int(11) unsigned NOT NULL,
  `ProID` int(11) unsigned NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_auctions_users` (`UserID`),
  KEY `fk_auctions_products` (`ProID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of auctions
-- ----------------------------
INSERT INTO `auctions` VALUES ('9', '2017-06-27 13:13:30', '380000', '1', '1');
INSERT INTO `auctions` VALUES ('10', '2017-06-27 13:13:44', '5320000', '1', '23');
INSERT INTO `auctions` VALUES ('11', '2017-06-27 13:50:25', '420000', '1', '1');
INSERT INTO `auctions` VALUES ('12', '2017-06-27 14:10:46', '360000', '1', '2');
INSERT INTO `auctions` VALUES ('13', '2017-06-27 14:21:16', '380000', '1', '1');
INSERT INTO `auctions` VALUES ('14', '2017-06-27 14:26:52', '6000000', '1', '23');
INSERT INTO `auctions` VALUES ('15', '2017-06-27 14:33:28', '450000', '1', '1');
INSERT INTO `auctions` VALUES ('16', '2017-06-27 14:37:28', '7860000', '1', '22');

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `CatID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `CatName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`CatID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES ('1', 'Quần áo');
INSERT INTO `categories` VALUES ('2', 'Giày dép');
INSERT INTO `categories` VALUES ('3', 'Điện thoại');
INSERT INTO `categories` VALUES ('4', 'Máy tính');
INSERT INTO `categories` VALUES ('5', 'Đồng hồ');
INSERT INTO `categories` VALUES ('6', 'Điện  máy gia đình');

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ProID` int(11) unsigned NOT NULL,
  `UserID` int(11) unsigned NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_favorites_users` (`UserID`),
  KEY `fk_favorites` (`ProID`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of favorites
-- ----------------------------
INSERT INTO `favorites` VALUES ('1', '10', '4');
INSERT INTO `favorites` VALUES ('2', '11', '4');
INSERT INTO `favorites` VALUES ('3', '15', '4');
INSERT INTO `favorites` VALUES ('4', '3', '4');
INSERT INTO `favorites` VALUES ('5', '5', '4');
INSERT INTO `favorites` VALUES ('6', '13', '4');
INSERT INTO `favorites` VALUES ('7', '12', '4');
INSERT INTO `favorites` VALUES ('8', '11', '3');
INSERT INTO `favorites` VALUES ('9', '22', '3');
INSERT INTO `favorites` VALUES ('10', '23', '3');
INSERT INTO `favorites` VALUES ('11', '25', '3');
INSERT INTO `favorites` VALUES ('12', '17', '3');
INSERT INTO `favorites` VALUES ('13', '30', '3');
INSERT INTO `favorites` VALUES ('14', '28', '3');
INSERT INTO `favorites` VALUES ('16', '1', '4');
INSERT INTO `favorites` VALUES ('30', '6', '1');
INSERT INTO `favorites` VALUES ('33', '25', '1');
INSERT INTO `favorites` VALUES ('34', '28', '1');
INSERT INTO `favorites` VALUES ('36', '7', '1');
INSERT INTO `favorites` VALUES ('37', '7', '1');
INSERT INTO `favorites` VALUES ('38', '21', '1');
INSERT INTO `favorites` VALUES ('39', '27', '1');
INSERT INTO `favorites` VALUES ('56', '2', '1');
INSERT INTO `favorites` VALUES ('57', '10', '1');
INSERT INTO `favorites` VALUES ('78', '24', '1');
INSERT INTO `favorites` VALUES ('83', '17', '1');
INSERT INTO `favorites` VALUES ('85', '1', '1');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `ProID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `ProName` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `TinyDes` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `FullDes` text COLLATE utf8_unicode_ci NOT NULL,
  `Price` int(11) NOT NULL,
  `CatID` int(11) unsigned NOT NULL,
  `Quantity` int(11) unsigned NOT NULL,
  `PriceToBuy` int(11) DEFAULT NULL,
  `UserID` int(11) unsigned DEFAULT NULL,
  `HandleID` int(11) unsigned DEFAULT NULL,
  `TimeUp` datetime DEFAULT NULL,
  `TimeDown` datetime DEFAULT NULL,
  `DeltaPrice` int(11) DEFAULT NULL,
  `State` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'đang đấu giá',
  PRIMARY KEY (`ProID`),
  KEY `fk_products_categories` (`CatID`),
  KEY `fk_products_users1` (`UserID`),
  KEY `fk_products_users` (`HandleID`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES ('1', 'Sơ mi nam cao cấp phong cách-SM0013500', 'Vải giãn nhung HQ,mịn,co giãn thoải mái,dày dặn,mịn màng,cuộn sườn,đẹp hết nấc', 'Vải giãn nhung HQ,mịn,co giãn thoải mái,dày dặn,mịn màng,cuộn sườn,đẹp hết nấc. Size M dưới 60-62kg,Size L dưới 65-67kg, Size XL dưới 70-72kg tuỳ chiều cao và cân nặng ', '370000', '1', '5', '400000', '1', null, '2017-06-06 13:00:12', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('2', 'Sơ mi nam tay ngắn thời trang-ASM01295210', 'Cotton xí nghiệp,mềm,mượt', 'Chất liệu: Cotton xí nghiệp,mềm,mượt\r\nSize: Size M dưới 60kg,Size L dưới 65kg, Size XL dưới 70kg tuỳ chiều cao và cân nặng \r\nMàu sắc: 3 màu y hình', '295000', '1', '3', '350000', '1', null, '2017-06-06 13:00:16', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('3', 'Áo thun nam thời trang-AT01260210', 'Thun cotton 4 chiều,dày,mượt', 'Chất liệu: Thun cotton 4 chiều,dày,mượt\r\nSize: M,L,XL\r\nMàu sắc: Trắng, đen\r\nHàng shop', '260000', '1', '4', '30000', '1', null, '2017-06-07 13:00:19', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('4', 'Áo thun nam thời trang-ATN009000', 'dày dặn,không xù lông,không rút,thấm hút mồ hôi,bo dệt,đẹp từng centimet', 'Chất liệu: Thun 100% cotton co giãn 4 chiều,mượt,dày dặn,không xù lông,không rút,thấm hút mồ hôi,bo dệt,đẹp từng centimet\r\nSize: M,L,XL \r\nMàu sắc: 2 màu như hình', '290000', '1', '3', '350000', '1', null, '2017-06-16 13:00:23', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('5', 'Quần jeans nam orginaility', 'thoải mái, êm', 'null', '310000', '1', '2', '400000', '1', null, '2017-06-07 13:00:19', '2017-07-05 13:01:16', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('6', ' \r\nQuần dài kaki nam cá tính', 'thoải mái, êm', 'null', '240000', '1', '6', '300000', '3', null, '2017-06-07 13:00:19', '2017-07-05 13:01:16', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('7', 'Quần sort nam-QS0011500', 'thoải mái, êm', 'Chất liệu:Cotton nhập \r\nSize: 29,30,31,32\r\nMàu sắc: 2 màu y hình', '330000', '1', '5', '400000', '4', null, '2017-06-07 13:00:19', '2017-07-05 13:01:16', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('8', ' \r\nQuần Short nam Polo Ralph Lauren', 'thoải mái, êm', 'Hàng chính hãng nhập khẩu từ Mỹ\r\nGiao hàng miễn phí', '1775000', '1', '3', '2000000', '5', null, '2017-06-07 13:00:19', '2017-07-04 13:01:30', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('9', 'Áo sơ mi nữ sọc paris', 'êm, thoáng mát', 'hàng tốt, uy tín', '230000', '1', '3', '300000', '5', null, '2017-06-07 13:00:19', '2017-07-04 13:01:30', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('10', 'Áo sơ mi hoạ tiết xích bích', 'Lụa lanh siêu mát,chất rất đẹp ', 'SALE: 195k ( có số lượng ) \r\n- Lụa lanh siêu mát,chất rất đẹp \r\n- Free size: Dưới 53kg\r\n- Màu: Đen, trắng', '195000', '1', '2', '250000', '5', null, '2017-06-07 13:00:19', '2017-07-04 13:01:30', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('11', 'Áo thun thêu hoa hồng và chữ', 'Thun cotton 100%,dày dặn rất đẹp,sờ chất thích liền mặc mát lạnh,from chuẩn đẹp ', '- Chất liệu: Thun cotton 100%,dày dặn rất đẹp,sờ chất thích liền mặc mát lạnh,from chuẩn đẹp \r\n- Màu sắc: Trắng,đen\r\n- Free size: Dưới 55kg', '290000', '1', '3', '350000', '5', null, '2017-06-07 13:00:19', '2017-07-08 13:01:37', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('12', 'Áo thun from rộng lông công', 'Thun cotton 100%,chất vải dày dặn,mịn đẹp,sờ chất thích liền,mặc mát thấm mồ hôi tốt,from rất đẹp ', '- Chất vải: Thun cotton 100%,chất vải dày dặn,mịn đẹp,sờ chất thích liền,mặc mát thấm mồ hôi tốt,from rất đẹp \r\n- Màu sắc: Đỏ\r\n- Free size: Dưới 55kg', '250000', '1', '2', '300000', '5', null, '2017-06-07 13:00:19', '2017-06-30 13:01:41', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('13', 'Quần jeans lưng thun paris', 'thoải mái êm', 'null', '320000', '1', '5', '400000', '5', null, '2017-06-23 13:00:42', '2017-07-09 13:01:44', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('14', 'Quần jean nữ Lucky Brand Lolita Skinny Jean', 'thoải mái, êm', 'Xuất xứ:	Chính hãng nhập từ Mỹ\r\nSize:	Xem bảng hướng dẫn chọn Size\r\nMàu sắc:	Như hình', '3000000', '1', '5', '4000000', '5', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('15', 'Đầm body đan dây sexy', 'Chất thun Nhập Lazza dày dặn', '- Chất thun Nhập Lazza dày dặn \r\n- Freesize 45-54kg cao 1,5-1,65m\r\n- Màu: Xanh rêu, hồng, đen', '360000', '1', '3', '450000', '5', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('16', ' \r\nĐầm body nịch eo kết nút nấm', 'Quý cô công sở quá là sang chảnh', '- Màu sắc: Đen, Đỏ Đô, Hồng dâu, Vàng bò,  Da tây. \r\n- Chất liệu: Thun cotton mỹ . \r\n- Quy cách may: Đường may sườn 1cm. ', '440000', '1', '3', '500000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('17', 'Giày nam Columbia Granite Ridge Hiking Shoe', 'thoải mái, êm chân', 'Chất liệu:	Da và Vải\r\nĐế giày:	Cao su\r\nChiều cao gót:	2cm\r\nXuất xứ:	Chính hãng nhập từ Mỹ', '2180000', '2', '5', '3000000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('18', 'Gìay bata viền nâu', 'thoải mái, êm chân', 'Size  35/39', '460000', '2', '3', '500000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('19', 'Giày nam Nunn Bush Alec Moc Toe', 'nhẹ, thoải mái, êm châm', 'Chất liệu:	Da/Sợi tồng hợp\r\nĐế giày:	Cao su\r\nChiều cao gót:	3cm\r\nXuất xứ:	Chính hãng nhập từ Mỹ', '2730000', '2', '6', '3000000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('20', 'điện thoại Nokia 6300', 'Các sản phẩm đều là hàng tồn kho của nokia sx tại phần lan', '- Bảo hành 6 tháng (1 đổi 1 trong tuần đầu). \r\n- Các sản phẩm đều là hàng tồn kho của nokia sx tại phần lan. \r\n- Main zin 100% nếu sai tặng luôn 5 máy, bao test imei cho anh em cửa hàng lấy về bán khách lẻ. ', '415000', '3', '20', '500000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('21', 'điện thoại Iphone 5 16G trắng Unlock', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 98%', 'Chức năng máy còn đầy đủ và làm việc 100%, máy chưa hề qua sửa chữa nhé, sản phẩm xách tay từ USA đã xài mạng AT&T hiện đã unlock', '5690000', '3', '1', '6000000', '4', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('22', 'điện thoại Iphone 5 Black 16Gb unlock', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 98%', 'Chức năng máy còn đầy đủ và làm việc 100%, máy chưa hề qua sửa chữa nhé, sản phẩm xách tay từ USA đã xài mạng AT&T hiện đã unlock', '6190000', '3', '1', '7000000', '5', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('23', ' \r\nLaptop Hp 2560p core i7 2620M', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng. Hàng ship Mỹ nguyên ZIN 100%, \r\nngoại hình mới đẹp 98-99%.', '5000000', '4', '2', '6000000', '1', null, '2017-06-19 13:01:09', '2017-07-13 13:02:03', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('24', 'Laptop Hp 2560p core i5 2520M', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng. Hàng ship Mỹ nguyên ZIN 100%,\r\nngoại hình mới đẹp 98-99%.', '4000000', '4', '2', '5000000', '3', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('25', ' \r\nHP 8560p Core i7 2620M', 'Laptop xách tay USA, còn mới 99%, nguyên zin 100%', 'Laptop xách tay USA, còn mới 99%, nguyên zin 100%', '8500000', '4', '3', '9000000', '1', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('26', ' \r\nĐồng hồ thông minh DZ09', 'Đồng thời đồng hồ thông minh sẽ giúp bạn giảm stress', 'martwatch DZ09 được thế kế bởi màn hình cảm ứng điện dung, có độ nhạy cao. Kích thước 1.55 inch phù hợp với tầm nhìn, độ phân giải màu sắc 240 x 240 meagpixel. Khung viền được gia cố rất kĩ bằng thép không gỉ, dây đeo bằng silicon vừa dẻo dai, vừa bền', '255000', '5', '5', '300000', '1', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('27', 'Đồng hồ nữ Seiko SUT249 Solar Analog Display', 'Mới Full box - nhập khẩu từ Mỹ', 'Bảo hành 24 tháng\r\nGiao hàng miễn phí trên toàn quốc', '3220000', '5', '3', '4000000', '1', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('28', ' \r\nThe Platinum - Đen - VƯƠNG QUỐC ANH', 'sang trọng, quý phái, đẳng cấp', 'Band Loại Chất liệu: Da \r\nTrường hợp Chất liệu: hợp kim \r\nTrường hợp Độ dày: 7 mm \r\nSố mẫu: thạch anh', '1200000', '5', '6', '2000000', '1', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('29', 'Quạt hơi nước PGT-4000G', 'Khi sử dụng máy làm mát USAircooler bạn sẽ không còn phải lo lắng về tiền điện tăng cao', 'công ty chúng tôi dám đảm bảo sản phẩm sẽ tiết kiệm tới 80% điện năng tiêu thụ so với máy lạnh có cùng diện tích sử dụng bên cạnh đó sản phẩm còn ﻿làm sạch không khí giúp bảo vệ sức khỏe cho mọi người đặc biệt là người già và trẻ nhỏ', '8752000', '6', '10', '9500000', '3', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('30', 'MÁY LỌC NƯỚC COWAY CHP-06ER', ' loại và loại bỏ hoàn toàn kim loại nặng', 'MÁY LỌC NƯỚC COWAY CHP-06ER, loại và loại bỏ hoàn toàn kim loại nặng, Clo, Asen, VOC, thuốc tẩy rửa, chất gây ung thư, và khi khuẩn gây hại cho nguồn nước... mang lại chất lượng nước tinh khiết nhất.', '15725000', '6', '5', '16500000', '4', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '10000', 'đang đấu giá');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('R3RapPfZl7BNh0QRPu6-9tRp454wbTKV', '1498583463', 0x7B22636F6F6B6965223A7B226F726967696E616C4D6178416765223A6E756C6C2C2265787069726573223A6E756C6C2C22687474704F6E6C79223A747275652C2270617468223A222F227D2C2269734C6F67676564223A747275652C22697341646D696E223A747275652C2275736572223A7B226964223A312C22757365726E616D65223A224461646177696E64222C226E616D65223A225472C6B0C6A16E67204D696E68205068C3A17420C490E1BAA174222C22656D61696C223A22746D706461743132303640676D61696C2E636F6D222C2261646472657373223A223332305C5C32325C5C3137412C204E677579E1BB856E2056C4836E204C696E682C205175E1BAAD6E20372C20545048434D222C2273636F7265506C7573223A34302C2273636F72654D696E7573223A352C2273636F7265223A312C22644F42223A22313939352D31322D33315431373A30303A30302E3030305A222C227065726D697373696F6E223A312C2270617373776F7264223A226531306164633339343962613539616262653536653035376632306638383365227D2C2263617274223A5B5D7D);
INSERT INTO `sessions` VALUES ('uraopHZ-B8axUDERsecbuIA4Kf37LJva', '1498635455', 0x7B22636F6F6B6965223A7B226F726967696E616C4D6178416765223A6E756C6C2C2265787069726573223A6E756C6C2C22687474704F6E6C79223A747275652C2270617468223A222F227D2C2269734C6F67676564223A747275652C22697341646D696E223A747275652C2275736572223A7B226964223A312C22757365726E616D65223A224461646177696E64222C226E616D65223A225472C6B0C6A16E67204D696E68205068C3A17420C490E1BAA174222C22656D61696C223A22746D706461743132303640676D61696C2E636F6D222C2261646472657373223A223332305C5C32325C5C3137412C204E677579E1BB856E2056C4836E204C696E682C205175E1BAAD6E20372C20545048434D222C2273636F7265506C7573223A34302C2273636F72654D696E7573223A352C2273636F7265223A312C22644F42223A22313939352D31322D33315431373A30303A30302E3030305A222C227065726D697373696F6E223A312C2270617373776F7264223A226531306164633339343962613539616262653536653035376632306638383365227D2C2263617274223A5B7B2270726F64756374223A7B2250726F4944223A32322C2250726F4E616D65223A22C49169E1BB876E2074686FE1BAA169204970686F6E65203520426C61636B203136476220756E6C6F636B222C225072696365223A363139303030307D2C227175616E74697479223A312C22616D6F756E74223A363139303030307D5D7D);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `Name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `Email` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `DOB` datetime NOT NULL,
  `Permission` int(11) NOT NULL,
  `ScorePlus` int(11) NOT NULL,
  `ScoreMinus` int(11) NOT NULL,
  `Address` text COLLATE utf8_unicode_ci NOT NULL,
  `Score` float NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'Dadawind', 'e10adc3949ba59abbe56e057f20f883e', 'Trương Minh Phát Đạt', 'tmpdat1206@gmail.com', '1996-01-01 00:00:00', '1', '40', '5', '320\\22\\17A, Nguyễn Văn Linh, Quận 7, TPHCM', '1');
INSERT INTO `users` VALUES ('3', 'Dadawind1', 'e10adc3949ba59abbe56e057f20f883e', 'Trương Minh Phát Đạt', 'wind8673@gmail.com', '1996-01-01 00:00:00', '0', '65', '15', '244&#x2F;33 Dương Đình Hội, quận 9', '0');
INSERT INTO `users` VALUES ('4', 'tvdong2', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Văn Đông', 'Superhihiha@gmail.com', '2017-06-04 00:00:00', '0', '50', '10', 'Nguyễn Thiện Thuật', '0.7');
INSERT INTO `users` VALUES ('5', 'tvdong', '86b5c378f5daa747fb9cb42f0e098267', 'Trần Văn Đông', 'Superhihihaha@gmail.com', '2017-06-04 00:00:00', '1', '60', '5', 'Nguyễn Thiện Thuật, TP.HCM', '1');
