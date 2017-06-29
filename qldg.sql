/*
Navicat MySQL Data Transfer

Source Server         : Mysql
Source Server Version : 50717
Source Host           : localhost:3306
Source Database       : qldg

Target Server Type    : MYSQL
Target Server Version : 50717
File Encoding         : 65001

Date: 2017-06-29 21:19:48
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
INSERT INTO `auctions` VALUES ('17', '2017-06-27 15:42:55', '480000', '5', '18');
INSERT INTO `auctions` VALUES ('18', '2017-06-27 15:43:55', '300000', '5', '4');
INSERT INTO `auctions` VALUES ('19', '2017-06-27 15:44:17', '5020000', '5', '23');
INSERT INTO `auctions` VALUES ('20', '2017-06-27 17:00:20', '440000', '5', '20');
INSERT INTO `auctions` VALUES ('22', '2017-06-27 17:00:40', '5720000', '5', '21');

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
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
INSERT INTO `favorites` VALUES ('86', '17', '5');
INSERT INTO `favorites` VALUES ('87', '3', '5');

-- ----------------------------
-- Table structure for feedbacks
-- ----------------------------
DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `ProID` int(11) NOT NULL,
  `ReceiverID` int(11) NOT NULL,
  `SenderID` int(11) NOT NULL,
  `Score` int(11) NOT NULL DEFAULT '0',
  `Note` varchar(255) COLLATE utf8_vietnamese_ci DEFAULT NULL,
  PRIMARY KEY (`SenderID`,`ReceiverID`,`ProID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_vietnamese_ci;

-- ----------------------------
-- Records of feedbacks
-- ----------------------------
INSERT INTO `feedbacks` VALUES ('16', '3', '1', '1', 'Rất bền mà đẹp');
INSERT INTO `feedbacks` VALUES ('4', '1', '3', '0', 'Mẫu mã đẹp');
INSERT INTO `feedbacks` VALUES ('5', '1', '3', '-1', 'Bị rách đũng quần');
INSERT INTO `feedbacks` VALUES ('8', '5', '4', '-1', 'Sản phẩm bị hỏng sau 1 tuần sử dụng');
INSERT INTO `feedbacks` VALUES ('7', '4', '5', '1', 'Sản phẩm chất lượng cao');

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
INSERT INTO `products` VALUES ('1', 'Sơ mi nam thời trang-ASM01295210', 'Chất liệu: Cotton xí nghiệp,mềm,mượt', 'Chất liệu: Cotton xí nghiệp,mềm,mượt\r\nSize: Size M dưới 60kg,Size L dưới 65kg, Size XL dưới 70kg tuỳ chiều cao và cân nặng\r\nMàu sắc: 2 màu y hình', '295000', '1', '5', '400000', '4', '5', '2017-06-06 13:00:12', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('2', 'Sơ mi nam tay ngắn thời trang-ASM01295210', 'Chất liệu: Cotton xí nghiệp,mềm,mượt', 'Chất liệu: Cotton xí nghiệp,mềm,mượt\r\nSize: Size M dưới 60kg,Size L dưới 65kg, Size XL dưới 70kg tuỳ chiều cao và cân nặng \r\nMàu sắc: 3 màu y hình', '295000', '1', '3', '400000', '1', null, '2017-06-06 13:00:16', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('3', 'Áo khoác BB Style HQ-AK013230310', 'Chất liệu: Vải xốp nhập cao cấp,lót trong xịn,nguyên phụ liệu nhập,đẹp từng centimet', 'Chất liệu: Vải xốp nhập cao cấp,lót trong xịn,nguyên phụ liệu nhập,đẹp từng centimet\r\nSize: M dưới 57kg,L dưới 65kg,XL dưới 70kg tuỳ chiều cao\r\nMàu sắc: Y hình', '460000', '1', '4', '600000', '1', null, '2017-06-07 13:00:19', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('4', 'Áo khoác nam logo-AKN0014500', 'Chất liệu: Si Nhật,dày,mịn,mượt,2 lớp', 'Chất liệu: Si Nhật,dày,mịn,mượt,2 lớp \r\nSize: M dưới 60kg tuỳ chiều cao\r\nSize: L dưới 70kg tuỳ chiều cao\r\nMàu sắc: 3 màu y hình', '390000', '1', '3', '500000', '1', '3', '2017-06-16 13:00:23', '2017-07-05 13:01:16', '10000', 'đang đấu giá');
INSERT INTO `products` VALUES ('5', 'Giày nam Columbia Granite Ridge Hiking Shoe', 'Hàng chính hãng nhập khẩu từ Mỹ', 'Hàng chính hãng nhập khẩu từ Mỹ\r\nMới Full box\r\nGiao hàng miễn phí', '2180000', '2', '2', '3000000', '1', '3', '2017-06-07 13:00:19', '2017-07-05 13:01:16', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('6', 'Giày nam Skechers USA Alven Revago Oxford', 'Hàng chính hãng nhập khẩu từ Mỹ', 'Hàng chính hãng nhập khẩu từ Mỹ\r\nMới Full box\r\nGiao hàng miễn phí', '1850000', '2', '6', '2000000', '3', null, '2017-06-07 13:00:19', '2017-07-05 13:01:16', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('7', 'Giày nam Kenneth Cole Unlisted', 'Hàng chính hãng nhập khẩu từ Mỹ', 'Hàng chính hãng nhập khẩu từ Mỹ\r\nMới Full box\r\nGiao hàng miễn phí', '1910000', '2', '5', '3000000', '4', '5', '2017-06-07 13:00:19', '2017-07-05 13:01:16', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('8', ' \r\nGiày nam Nunn Bush Alec Moc Toe', 'Hàng chính hãng nhập khẩu từ Mỹ', 'Hàng chính hãng nhập khẩu từ Mỹ\r\nMới Full box\r\nGiao hàng miễn phí', '2730000', '2', '3', '4000000', '5', '4', '2017-06-07 13:00:19', '2017-07-04 13:01:30', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('9', 'IPHONE 6S PLUS XÁCH TAY ĐÀI LOAN', 'Hàng xách tay, mới 100%', 'Hàng xách tay mới 100%, giao hàng miễn phí', '2700000', '3', '3', '4000000', '5', null, '2017-06-07 13:00:19', '2017-07-04 13:01:30', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('10', 'điện thoại Iphone 5 white 16Gb unlock', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 97%', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 97%', '6450000', '3', '2', '7000000', '5', null, '2017-06-07 13:00:19', '2017-07-04 13:01:30', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('11', 'Đấu giá điện thoại Iphone 5 Black 16Gb unlock', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 97%', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 97%', '6190000', '3', '3', '7000000', '5', null, '2017-06-07 13:00:19', '2017-07-08 13:01:37', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('12', ' \r\nNokia XL - 5.0', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 97%', 'Sản phẩm đã qua sử dụng nhưng còn rất mới 97%', '3399000', '3', '2', '5000000', '5', null, '2017-06-07 13:00:19', '2017-06-30 13:01:41', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('13', ' \r\nLaptop Hp 2560p core i5 2520M', 'Hàng Mỹ-zin-đẹp như mới', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng. Hàng ship Mỹ nguyên ZIN 100%,\r\nngoại hình mới đẹp 98-99%.', '4000000', '4', '6', '6000000', '5', null, '2017-06-23 13:00:42', '2017-07-09 13:01:44', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('14', 'Dell E6410 i5 540M', 'Hàng Mỹ-zin-đẹp như mới', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng. Hàng ship Mỹ nguyên ZIN 100%,\r\nngoại hình mới đẹp 98-99%.', '3800000', '4', '5', '5000000', '5', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('15', 'Hp 8460p core i5 2540', 'Hàng Mỹ-zin-đẹp như mới', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng. Hàng ship Mỹ nguyên ZIN 100%,\r\nngoại hình mới đẹp 98-99%.', '4600000', '4', '3', '6000000', '5', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('16', 'Dell Precision M4600 i7QM', 'Hàng Mỹ-zin-đẹp như mới', 'Dòng máy doanh nhân cao cấp, vỏ nhôm màu bạc sang trọng. Hàng ship Mỹ nguyên ZIN 100%,\r\nngoại hình mới đẹp 98-99%.', '12800000', '4', '3', '14000000', '3', '1', '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('17', ' \r\nĐồng hồ nữ Seiko SUT249 Solar Analog Display', 'Mới Full box - nhập khẩu từ Mỹ', 'Mới Full box - nhập khẩu từ Mỹ\r\nBảo hành 24 tháng\r\nGiao hàng miễn phí trên toàn quốc', '3220000', '5', '5', '4000000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('18', ' \r\nĐồng hồ nữ Seiko SXDG37 Analog Display Japanese', 'Mới Full box - nhập khẩu từ Mỹ', 'Mới Full box - nhập khẩu từ Mỹ\r\nBảo hành 24 tháng\r\nGiao hàng miễn phí trên toàn quốc', '2480000', '5', '3', '3000000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('19', 'Đồng hồ nữ Seiko SUT168 Analog Display Japanese', 'Mới Full box - nhập khẩu từ Mỹ', 'Mới Full box - nhập khẩu từ Mỹ\r\nBảo hành 24 tháng\r\nGiao hàng miễn phí trên toàn quốc', '3915000', '5', '6', '4000000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('20', ' \r\nĐồng hồ nữ Seiko SUT224 Ladies Dress Solar ', 'Mới Full box - nhập khẩu từ Mỹ', 'Mới Full box - nhập khẩu từ Mỹ\r\nBảo hành 24 tháng\r\nGiao hàng miễn phí trên toàn quốc', '3955000', '5', '20', '5000000', '3', null, '2017-06-23 13:00:42', '2017-07-02 13:01:53', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('21', ' \r\nMáy hấp trứng, đồ ăn 2 tầng My Dream đa năng', 'Máy hấp trứng, đồ ăn 2 tầng My Dream đa năng', '- Máy hấp đa năng 2 tầng làm bằng nhựa cao cấp, an toàn\r\n- Làm chín thức ăn bằng hơi nước.\r\n- Không bị mất đi chất dinh dưỡng.', '378000', '6', '1', '450000', '4', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('22', 'Bàn là hơi', 'Công suất 1600W cho tạo ra lượng hơi nước với áp suất mạnh và hơi nóng cao', 'Công suất 1600W cho tạo ra lượng hơi nước với áp suất mạnh và hơi nóng cao để việc là ủi được nhanh hơn, dễ dàng hơn.\r\n\r\nTự động ngắt khi hết nước hoặc quá tải.\r\nThời gian tạo hơi nhanh chỉ từ 40-45 giây là có thể bắt đầu ủi.', '1840000', '6', '1', '2500000', '5', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('23', 'Quạt sạc HJD FL 301 (2 bình ắc qui)', 'bền đẹp', 'Nguồn điện : AC 100V - 240V / 50Hz\r\nBình ắc quy khô (PT4.5-6) : 6V-4.5Ah\r\nBóng đèn Led : 2LED\r\nDòng điện sạc : 300 mA', '897000', '6', '2', '1000000', '1', null, '2017-06-19 13:01:09', '2017-07-13 13:02:03', '20000', 'đang đấu giá');
INSERT INTO `products` VALUES ('24', ' \r\nẤm đun Electrolux EEK 1303W', 'Ấm siêu tốc Electrolux EEK1303W sở hữu dung tích 1.5L có cấu tạo đặc biệt', 'm siêu tốc Electrolux EEK1303W sở hữu dung tích 1.5L có cấu tạo đặc biệt với công suất lên đến 2200W cho khả năng tỏa nhiệt cao, giúp tiết kiệm thời gian đun nước. Thiết kế bình đun Electrolux EEK1303W với vỏ bằng nhựa cao cấp, đảm bảo an toàn vệ sinh khi sử dụng.', '552000', '6', '2', '650000', '3', null, '2017-06-23 13:00:42', '2017-07-13 13:02:03', '20000', 'đang đấu giá');

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
INSERT INTO `sessions` VALUES ('5ffIpJmyWczfRL3fwBgHsDL0-uWhgRym', '1498753187', 0x7B22636F6F6B6965223A7B226F726967696E616C4D6178416765223A6E756C6C2C2265787069726573223A6E756C6C2C22687474704F6E6C79223A747275652C2270617468223A222F227D2C2269734C6F67676564223A747275652C22697341646D696E223A66616C73652C2275736572223A7B226964223A342C22757365726E616D65223A227476646F6E6732222C226E616D65223A225472E1BAA76E2056C4836E20C490C3B46E67222C22656D61696C223A22537570657268696869686140676D61696C2E636F6D222C2261646472657373223A224E677579E1BB856E20546869E1BB876E20546875E1BAAD74222C2273636F7265506C7573223A35302C2273636F72654D696E7573223A31302C2273636F7265223A302E372C22644F42223A22313939362D30362D30335431373A30303A30302E3030305A222C227065726D697373696F6E223A302C2270617373776F7264223A226531306164633339343962613539616262653536653035376632306638383365227D2C2263617274223A5B5D7D);
INSERT INTO `sessions` VALUES ('AqfMfxHaD4hIOOeEAnNxULW-5XCdsTxd', '1498806235', 0x7B22636F6F6B6965223A7B226F726967696E616C4D6178416765223A6E756C6C2C2265787069726573223A6E756C6C2C22687474704F6E6C79223A747275652C2270617468223A222F227D2C2269734C6F67676564223A66616C73652C22697341646D696E223A66616C73657D);
INSERT INTO `sessions` VALUES ('ZVxhcj4iCuuBWZEJheU0hvIDRrFdxGhw', '1498752587', 0x7B22636F6F6B6965223A7B226F726967696E616C4D6178416765223A6E756C6C2C2265787069726573223A6E756C6C2C22687474704F6E6C79223A747275652C2270617468223A222F227D2C2269734C6F67676564223A747275652C22697341646D696E223A66616C73652C2275736572223A7B226964223A342C22757365726E616D65223A227476646F6E6732222C226E616D65223A225472E1BAA76E2056C4836E20C490C3B46E67222C22656D61696C223A22537570657268696869686140676D61696C2E636F6D222C2261646472657373223A224E677579E1BB856E20546869E1BB876E20546875E1BAAD74222C2273636F7265506C7573223A35302C2273636F72654D696E7573223A31302C2273636F7265223A302E372C22644F42223A22313939362D30362D30335431373A30303A30302E3030305A222C227065726D697373696F6E223A302C2270617373776F7264223A226531306164633339343962613539616262653536653035376632306638383365227D2C2263617274223A5B5D7D);
INSERT INTO `sessions` VALUES ('mq0hjEggeuiuj7ZyP8XaRbrys9zjEVa4', '1498790924', 0x7B22636F6F6B6965223A7B226F726967696E616C4D6178416765223A6E756C6C2C2265787069726573223A6E756C6C2C22687474704F6E6C79223A747275652C2270617468223A222F227D2C2269734C6F67676564223A66616C73652C22697341646D696E223A66616C73657D);
INSERT INTO `sessions` VALUES ('vx-ozAhSGI_uxBw7C-kGtlcnk9X4dBx3', '1498747669', 0x7B22636F6F6B6965223A7B226F726967696E616C4D6178416765223A6E756C6C2C2265787069726573223A6E756C6C2C22687474704F6E6C79223A747275652C2270617468223A222F227D2C2269734C6F67676564223A747275652C22697341646D696E223A66616C73652C2275736572223A7B226964223A342C22757365726E616D65223A227476646F6E6732222C226E616D65223A225472E1BAA76E2056C4836E20C490C3B46E67222C22656D61696C223A22537570657268696869686140676D61696C2E636F6D222C2261646472657373223A224E677579E1BB856E20546869E1BB876E20546875E1BAAD74222C2273636F7265506C7573223A35302C2273636F72654D696E7573223A31302C2273636F7265223A302E372C22644F42223A22313939362D30362D30335431373A30303A30302E3030305A222C227065726D697373696F6E223A302C2270617373776F7264223A226531306164633339343962613539616262653536653035376632306638383365227D2C2263617274223A5B5D7D);

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'Dadawind', 'e10adc3949ba59abbe56e057f20f883e', 'Trương Minh Phát Đạt', 'tmpdat1206@gmail.com', '1996-01-01 00:00:00', '1', '40', '5', '320\\22\\17A, Nguyễn Văn Linh, Quận 7, TPHCM', '0.85');
INSERT INTO `users` VALUES ('3', 'Dadawind1', 'e10adc3949ba59abbe56e057f20f883e', 'Trương Minh Phát Đạt', 'wind8673@gmail.com', '1996-01-01 00:00:00', '0', '65', '15', '244&#x2F;33 Dương Đình Hội, quận 9', '0.3');
INSERT INTO `users` VALUES ('4', 'tvdong2', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Văn Đông', 'Superhihiha@gmail.com', '1996-06-04 00:00:00', '0', '50', '10', 'Nguyễn Thiện Thuật', '0.7');
INSERT INTO `users` VALUES ('5', 'tvdong', 'e10adc3949ba59abbe56e057f20f883e', 'Trần Văn Đông', 'Superhihihaha@gmail.com', '1996-06-04 00:00:00', '1', '60', '5', 'Nguyễn Thiện Thuật, TP.HCM', '0.92');
INSERT INTO `users` VALUES ('7', 'nqduy', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Quốc Duy', 'nqduy96@gmail.com', '1996-02-02 00:00:00', '1', '110', '30', 'Quận 8, TP.HCM', '0.81');
INSERT INTO `users` VALUES ('8', 'nqduy2', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Quốc Duy', 'nqduy96@gmail.com', '1996-02-02 00:00:00', '0', '78', '35', 'Quận 8, TP.HCM', '0.43');
