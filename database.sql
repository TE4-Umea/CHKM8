-- --------------------------------------------------------
-- Värd:                         127.0.0.1
-- Serverversion:                5.7.27-0ubuntu0.18.04.1 - (Ubuntu)
-- Server-OS:                    Linux
-- HeidiSQL Version:             10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumpar databasstruktur för time
DROP DATABASE IF EXISTS `time`;
CREATE DATABASE IF NOT EXISTS `time` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `time`;

-- Dumpar struktur för tabell time.checks
DROP TABLE IF EXISTS `checks`;
CREATE TABLE IF NOT EXISTS `checks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID of the check',
  `user` int(11) DEFAULT NULL COMMENT 'ID of the user',
  `check_in` tinyint(4) DEFAULT NULL COMMENT 'Boolean(0-1) if the it was a check in (otherwise check out)',
  `project` text COMMENT 'Name of the project',
  `date` bigint(20) DEFAULT NULL COMMENT 'Date of the project',
  `type` text COMMENT 'Check in type (web, card, TOP SECRET)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=504 DEFAULT CHARSET=latin1;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell time.joints
DROP TABLE IF EXISTS `joints`;
CREATE TABLE IF NOT EXISTS `joints` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID of the joint',
  `project` int(11) DEFAULT NULL COMMENT 'ID of the project',
  `user` int(11) DEFAULT NULL COMMENT 'ID of the user',
  `work` bigint(20) DEFAULT NULL COMMENT 'Work done in ms (1 hour of work = 3600000)',
  `date` bigint(20) DEFAULT NULL COMMENT 'Date of joining the project',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell time.projects
DROP TABLE IF EXISTS `projects`;
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID  of the project',
  `name` text COMMENT 'Name of the project',
  `owner` int(11) DEFAULT NULL,
  `color_top` text,
  `color_bot` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell time.tokens
DROP TABLE IF EXISTS `tokens`;
CREATE TABLE IF NOT EXISTS `tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID of the token',
  `user` int(11) DEFAULT NULL COMMENT 'ID of the user',
  `token` text COMMENT 'Token',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=latin1;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell time.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID of the user',
  `username` text COMMENT 'User chosen name',
  `name` text COMMENT 'Full name of the user ',
  `password` text,
  `created` bigint(20) DEFAULT NULL COMMENT 'The date the user was created',
  `admin` tinyint(4) DEFAULT NULL COMMENT 'Boolean(0-1) if the user is an admin or not.',
  `email` text COMMENT 'Email of the user',
  `avatar` text COMMENT 'Link of the username',
  `access_token` text COMMENT 'Access token given by slack, used to update user information',
  `slack_id` text,
  `slack_domain` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=latin1;

-- Dataexport var bortvalt.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
