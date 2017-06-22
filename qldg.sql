/*
Navicat MySQL Data Transfer

Source Server         : MySQL
Source Server Version : 50717
Source Host           : localhost:3306
Source Database       : qldg

Target Server Type    : MYSQL
Target Server Version : 50717
File Encoding         : 65001

Date: 2017-06-22 11:19:53
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
  KEY `fk_auctions_products` (`ProID`),
  CONSTRAINT `fk_auctions_products` FOREIGN KEY (`ProID`) REFERENCES `products` (`ProID`),
  CONSTRAINT `fk_auctions_users` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `CatID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `CatName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`CatID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  KEY `fk_favorites` (`ProID`),
  CONSTRAINT `fk_favorites` FOREIGN KEY (`ProID`) REFERENCES `products` (`ProID`),
  CONSTRAINT `fk_favorites_users` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `UserID` int(11) unsigned NOT NULL,
  `HandleID` int(11) unsigned DEFAULT NULL,
  `TimeUp` datetime NOT NULL,
  `TimeDown` datetime NOT NULL,
  PRIMARY KEY (`ProID`),
  KEY `fk_products_categories` (`CatID`),
  KEY `fk_products_users1` (`UserID`),
  KEY `fk_products_users` (`HandleID`),
  CONSTRAINT `fk_products_categories` FOREIGN KEY (`CatID`) REFERENCES `categories` (`CatID`),
  CONSTRAINT `fk_products_users` FOREIGN KEY (`HandleID`) REFERENCES `users` (`ID`),
  CONSTRAINT `fk_products_users1` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `Password` varchar(16) COLLATE utf8_unicode_ci NOT NULL,
  `Name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `Email` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `DOB` datetime NOT NULL,
  `Permission` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `Score` int(11) NOT NULL,
  `Address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
