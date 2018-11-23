-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 23, 2018 at 12:09 AM
-- Server version: 5.7.24-0ubuntu0.16.04.1
-- PHP Version: 7.0.32-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `murakami`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_tokens`
--

CREATE TABLE `access_tokens` (
  `token` varchar(50) NOT NULL,
  `page` varchar(20) NOT NULL,
  `date` datetime NOT NULL,
  `used` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `attempts`
--

CREATE TABLE `attempts` (
  `id` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `outcome` tinyint(4) NOT NULL DEFAULT '1',
  `login_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `carbon`
--

CREATE TABLE `carbon` (
  `transaction_id` varchar(30) NOT NULL,
  `group_id` varchar(12) NOT NULL,
  `user_id` varchar(25) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `trans_object` text NOT NULL,
  `method` varchar(25) NOT NULL DEFAULT 'recycled',
  `trans_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `carbon_categories`
--

CREATE TABLE `carbon_categories` (
  `carbon_id` varchar(6) NOT NULL,
  `name` varchar(50) NOT NULL,
  `factors` text NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `carbon_categories`
--

INSERT INTO `carbon_categories` (`carbon_id`, `name`, `factors`, `active`) VALUES
('IT-100', 'Textiles', '{"generated":"20.44","recycled":"-5.83","incinerated":"0.22","landfilled":"0.6","composted":"0","reused":"0","stored":"0","other":"0"}', 1),
('IT-101', 'Electronics', '{\n  "generated":1.76,\n  "recycled":0.02,\n  "incinerated":0.02,\n  "landfilled":0.02,\n  "composted":0,\n  "reused": 0,\n  "stored": 0,\n  "other": 0\n}\n', 1),
('IT-102', 'Books', '{\n  "generated":0.94,\n  "recycled":-0.55,\n  "incinerated":-0.18,\n  "landfilled":0.50,\n  "composted":0,\n  "reused": 0,\n  "stored": 0,\n  "other": 0\n}\n', 1),
('IT-103', 'Plastics', '{   "generated":3.18,   "recycled":-0.54,   "incinerated":1.66,   "landfilled":0,   "composted":0,   "reused": 0,   "stored": 0,   "other": 0 }', 1),
('IT-104', 'Metal', '{\r\n  "generated":3.89,\r\n  "recycled":-2.54,\r\n  "incinerated":0.06,\r\n  "landfilled":0,\r\n  "composted":0,\r\n  "reused": 0,\r\n  "stored": 0,\r\n  "other": 0\r\n}', 1),
('IT-105', 'Wood', '{\r\n  "generated":0.51,\r\n  "recycled":-0.29,\r\n  "incinerated":-0.27,\r\n  "landfilled":0.92,\r\n  "composted":0,\r\n  "reused": 0,\r\n  "stored": 0,\r\n  "other": 0\r\n}', 1),
('IT-106', 'Glass/Ceramic', '{\r\n  "generated":1.21,\r\n  "recycled":-0.75,\r\n  "incinerated":0.07,\r\n  "landfilled":0,\r\n  "composted":0,\r\n  "reused": 0,\r\n  "stored": 0,\r\n  "other": 0\r\n}', 1),
('IT-107', 'Food', '{"generated":"3.74","recycled":"0","incinerated":"-0.01","landfilled":"0.99","composted":"-0.08","reused":"0","stored":"0","other":-0.08}', 1),
('IT-108', 'Paper & Card', '{"generated":"0.87","recycled":"-0.55","incinerated":"-0.18","landfilled":"0.5","composted":"0","reused":"0","stored":"0","other":-0.08}', 1),
('IT-109', 'Furniture', '{"generated":"2.14","recycled":"0.02","incinerated":"0.02","landfilled":"0.20","composted":"0","reused":"0","stored":"0","other":-0.08}', 1),
('IT-110', 'Household Waste', '{"generated":"0","recycled":"2.75","incinerated":"-0.57","landfilled":"0.4","composted":"0","reused":"0","stored":"0","other":"0"}', 1),
('IT-111', 'Computer Equipment', '{"generated":"27.00","recycled":"0.02","incinerated":"0.02","landfilled":"0.02","composted":"0","reused":"0","stored":"0","other":"0"}', 1),
('IT-112', 'Bicycles', '{"generated":"4.28","recycled":"-2.54","incinerated":"0.06","landfilled":"0.00","composted":"0","reused":"0","stored":"0","other":"0"}', 1),
('IT-113', 'Tools', '{"generated":"1.76","recycled":"0.02","incinerated":"0.02","landfilled":"0.02","composted":"0","reused":"0","stored":"0","other":"0"}', 1),
('IT-114', 'Paint', '{"generated":"2.91","recycled":"0","incinerated":"0.40","landfilled":"0.00","composted":"0","reused":"0","stored":"0","other":"0"}', 1);

-- --------------------------------------------------------

--
-- Table structure for table `global_settings`
--

CREATE TABLE `global_settings` (
  `id` int(11) NOT NULL,
  `definitions` text NOT NULL,
  `password_reset` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `id` varchar(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `volunteer` tinyint(4) NOT NULL DEFAULT '0',
  `admin` tinyint(4) NOT NULL DEFAULT '0',
  `working_groups` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deactivated` tinyint(4) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `login` (`id`, `username`, `first_name`, `last_name`, `email`, `password`, `volunteer`, `admin`, `working_groups`, `created_at`, `deactivated`) VALUES
('01746918152', 'test.till', 'Test', 'Swapshop', 'hello@rosshudson.co.uk', '$2a$10$s/TIShnWvvCx9GHGphyyDuzRQkPqhGSrM.SZk32EkVbE/KmQagsse', 0, 0, '["WG-100"]', '2018-05-24 23:02:28', 0),
('01746919992', 'test.admin', 'Test', 'Admin', 'rosshudson8@gmail.com', '$2a$10$s/TIShnWvvCx9GHGphyyDuzRQkPqhGSrM.SZk32EkVbE/KmQagsse', 0, 1, '["WG-100","WG-101","WG-105","WG-108"]', '2018-05-24 23:02:28', 0);

-- --------------------------------------------------------

--
-- Table structure for table `mail_templates`
--

CREATE TABLE `mail_templates` (
  `active` tinyint(4) NOT NULL DEFAULT '0',
  `mail_id` varchar(50) NOT NULL,
  `mail_desc` text NOT NULL,
  `subject` text NOT NULL,
  `markup` longtext NOT NULL,
  `plaintext` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `mail_templates`
--

INSERT INTO `mail_templates` (`active`, `mail_id`, `mail_desc`, `subject`, `markup`, `plaintext`) VALUES
(1, 'free_membership_reminder', 'Sent 6 weeks after a free member last volunteered', 'Your Free Membership Will Expire!', '<p><strong>Hey |first_name|!</strong></p><p>We see you haven\'t volunteered in a while :-(</p><p>Your free membership will expire if you don\'t volunteer by |exp_date|. If your schedule has changed and you can no longer volunteer at least once every 2 months, feel free to pop in and become a paid member. If you don\'t feel like staying a member, that\'s ok - you can continue your membership at anytime (we\'ll retain your information for 2 years after expiration)</p><p>From Shrub Co-op</p>', 'Hey |first_name|!\n\nWe see you haven\'t volunteered in a while :-(\n\nYour free membership will expire if you don\'t volunteer by |exp_date|. If your schedule has changed and you can no longer volunteer at least once every 2 months, feel free to pop in and become a paid member. If you don\'t feel like staying a member, that\'s ok - you can continue your membership at anytime (we\'ll retain your information for 2 years after expiration)\n\nFrom Shrub Co-op'),
(0, 'goodbye', 'Sent when membership expires', 'Your Membership Expired', '<p>We\'re sorry to see you go, |first_name|</p>', 'We\'re sorry to see you go, |first_name|'),
(1, 'hello', 'Sent when new member signs up', 'Welcome to SHRUB!', '<p><strong><span style="font-size: 18px;">Hey |first_name|!</span></strong></p><p dir="ltr">You’re now a member of Edinburgh’s hub for creative reuse. Hurray!</p><p dir="ltr">Our vision is for a world without waste. We are a non-hierarchical cooperative and anyone can get involved! We run a Swapshop, DIY bike workshops at the Wee Spoke Hub, a food sharing project, and we host lots of upcycling workshops and events.&nbsp;</p><p dir="ltr">You can find out more about what we do and how we organise at <a href="https://www.shrubcoop.org/who-we-are/">https://www.shrubcoop.org/who-we-are/</a></p><p dir="ltr"><br></p><p dir="ltr"><strong><span style="font-family: Arial, Helvetica, sans-serif; font-size: 24px; color: rgb(171, 12, 23);">Come along to one of our Warm Welcome events!<br></span></strong></p><p dir="ltr">We have a Warm Welcome event for new members <strong>every</strong> <strong>4th Thursday&nbsp;</strong>of the month at <strong>4.30pm</strong> in the <strong>Swapshop</strong> at 22 Bread Street - come along and say hello! We\'ll tell you about how SHRUB works and what volunteer opportunities we have available.</p><p dir="ltr"><br></p><p dir="ltr"><strong><span style="font-size: 24px; color: rgb(171, 12, 23);">Welfare and safer spaces policy</span></strong><br><br></p><p>SHRUB aims to provide a safe environment, which is welcoming, engaging and supportive for everyone. By becoming a member, you agree to behave in accordance with this policy when at SHRUB, during SHRUB events, and through SHRUB’s social media, emails or other messages with those involved with SHRUB!</p><p>You can read the full safer spaces policy at: <a href="https://www.shrubcoop.org/wp-content/uploads/2018/02/SHRUB-Safer-Spaces-Policy-2.0.pdf" rel="noopener noreferrer" target="_blank">https://www.shrubcoop.org/wp-content/uploads/2018/02/SHRUB-Safer-Spaces-Policy-2.0.pdf</a></p><p>You can also contact the welfare working group if you have any problems or require support: <a href="mailto:shrubwelfare@gmail.com">shrubwelfare@gmail.com</a></p><p><br></p><p dir="ltr"><strong><span style="font-size: 24px; color: rgb(171, 12, 23);">Join our Communication channels!</span></strong></p><ol><li dir="ltr"><p dir="ltr"><strong>Visit&nbsp;</strong>our website!<br><a href="https://www.shrubcoop.org/">https://www.shrubcoop.org/</a><br><br><strong>Follow&nbsp;</strong>us on Facebook, Twitter, and Instagram to keep in the loop about SHRUB events and volunteer opportunities!<br><a href="https://www.facebook.com/shrubcoop/">@shrubcoop</a><br><br></p></li><li dir="ltr"><p dir="ltr"><strong>Join&nbsp;</strong>the Members group to ideas with the community!<br>SHRUB Co-op: Members Group (<a href="https://www.facebook.com/groups/shrubmembers/">https://www.facebook.com/groups/shrubmembers/</a>)<br><br></p></li><li dir="ltr"><p dir="ltr"><strong>Follow&nbsp;</strong>our other projects to find out how to get involved more!<br><a href="https://www.facebook.com/ZeroWasteEdinburgh/">@ZeroWasteEdinburgh</a><br><a href="https://www.facebook.com/weespokehub">@weespokehub</a><br><a href="https://www.facebook.com/foodsharingedinburgh/">@foodsharingedinburgh</a></p></li><li dir="ltr"><p dir="ltr"><strong>Subscribe&nbsp;</strong>to our newsletters!<br><br><a href="https://shrubcoop.us4.list-manage.com/subscribe?u=a28a538c55f3604b70c8e2cf3&amp;id=c529cb77fc">SHRUB newsletter</a><br><a href="https://wordpress.us11.list-manage.com/subscribe?u=f0679a647beb751d103b9186c&amp;id=151be9d1e8">Food Sharing Edinburgh newsletter</a></p></li><li dir="ltr"><p dir="ltr"><strong>Subscribe&nbsp;</strong>to our google <a href="https://calendar.google.com/calendar/b/1?cid=cGdnYTJrbnI4cm4xMTB0bWxkaDZsZ3VsZmNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ">calendar</a>!</p></li></ol><p><br></p><p dir="ltr"><span style="color: rgb(171, 12, 23);"><strong><span style="font-size: 24px;">Love</span></strong></span></p><p dir="ltr">The SHRUB Community xx</p><p><br></p>', 'Hey, |first_name|!\n\nThanks for joining Shrub.\n\nLove Shrub Co-op'),
(1, 'membership_id_reminder', 'Reminds members of their unique ID', 'Your Membership ID', '<p>Hey |first_name|,</p><p>Your unique membership ID is: |membership_id|<br><br>You can use this ID to log the hours you volunteer <a href="https://murakami.org.uk/log" rel="noopener noreferrer" target="_blank">here</a>.<br><br>Kind regards,</p><p>Shrub Co-op</p>', ''),
(1, 'renewal_notice_long', 'Sent 1 month before membership expires', 'Membership Renewal Reminder', '<p><strong>Hey |first_name|!</strong></p><p>We\'d like to take the chance to thank you for your support over the past 12 months. As a cooperative our members involvement is extremely important and very much appreciated.</p><p>We understand you\'re busy and just wanted to take this time to remind you that your membership will expire on <strong>|exp_date|</strong>.</p><p>If you\'re still deciding whether or not to renew, or just haven\'t gotten around to it yet, please consider the important role our members play in setting the agenda for and supporting SHRUB\'s vision of a world without waste.</p><p>We would also like to remind you of the benefits of your membership.</p><p>With a Shrub co-op membership, you can:</p><ul><li>Support our vision of a world without waste and our work to create a circular economy</li><li>Bring in stuff you don\'t need and get swap tokens added to your account</li><li>Spend the tokens when you want, on things you do need and shop without money!</li><li>Get great free stuff in the Co-op Members\' Freeshop</li><li>Join co-op meetings and have a say in how the Shrub develops</li><li>Be part of an active community of change-makers</li><li>Member only monthly parties!</li></ul><p>We hope that you\'ll take this time to renew your membership and remain a part of our community. It couldn\'t be easier - just pop into the swapshop to renew!<br></p><p>Kind regards,</p><p>Shrub Co-op</p>', 'Hey |first_name|!\n\nWe\'d like to take the chance to thank you for your support over the past 12 months. As a cooperative our members involvement is extremely important and very much appreciated.\n\nWe understand you\'re busy and just wanted to take this time to remind you that your membership will expire on |exp_date|.\n\nIf you\'re still deciding whether or not to renew, or just haven\'t gotten around to it yet, please consider the important role our members play in setting the agenda for and supporting SHRUB\'s vision of a world without waste.\n\nWe would also like to remind you of the benefits of your membership.\n\nWith a Shrub co-op membership, you can:\n\n- Support our vision of a world without waste and our work to create a circular economy\n- Bring in stuff you don\'t need and get swap tokens added to your account\n- Spend the tokens when you want on things you do need â€“ shop without money!\n- Get great free stuff in the Co-op Members\' Freeshop\n- Join co-op meetings and have a say in how the Shrub develops\n- Be part of an active community of change-makers\n- Member only monthly parties!\n\nWe hope that you\'ll take this time to renew your membership and remain a part of our community. It couldn\'t be easier - just [click here](https://www.shrubcoop.org/become-a-member/) to renew!\n\nKind regards,\n\nShrub Co-op'),
(1, 'renewal_notice_short', 'Sent 1 week before membership expires', 'Membership Renewal Reminder', '<p><strong>Hey |first_name|!</strong></p><p>We\'d like to take the chance to thank you for your support over the past 12 months. As a cooperative our members involvement is extremely important and very much appreciated.</p><p>We understand you\'re busy and just wanted to take this time to remind you that your membership will expire in one week\'s time (<strong>|exp_date|</strong>).</p><p>If you\'re still deciding whether or not to renew, or just haven\'t gotten around to it yet, please consider the important role our members play in setting the agenda for and supporting SHRUB\'s vision of a world without waste.</p><p>We would also like to remind you of the benefits of your membership.</p><p>With a Shrub co-op membership, you can:</p><ul><li>Support our vision of a world without waste and our work to create a circular economy</li><li>Bring in stuff you don\'t need and get swap tokens added to your account</li><li>Spend the tokens when you want on things you do need - shop without money!</li><li>Get great free stuff in the Co-op Members\' Freeshop</li><li>Join co-op meetings and have a say in how the Shrub develops</li><li>Be part of an active community of change-makers</li><li>Member only monthly parties!</li></ul><p>We hope that you\'ll take this time to renew your membership and remain a part of our community. It couldn\'t be easier - just pop into the swapshop to renew!<br></p><p>Kind regards,</p><p>Shrub Co-op</p>', 'Hey |first_name|!\n\nWe\'d like to take the chance to thank you for your support over the past 12 months. As a cooperative our members involvement is extremely important and very much appreciated.\n\nWe understand you\'re busy and just wanted to take this time to remind you that your membership will expire in one week\'s time (|exp_date|).\n\nIf you\'re still deciding whether or not to renew, or just haven\'t gotten around to it yet, please consider the important role our members play in setting the agenda for and supporting SHRUB\'s vision of a world without waste.\n\nWe would also like to remind you of the benefits of your membership.\n\nWith a Shrub co-op membership, you can:\n\n- Support our vision of a world without waste and our work to create a circular economy\n- Bring in stuff you don\'t need and get swap tokens added to your account\n- Spend the tokens when you want on things you do need - shop without money!\n- Get great free stuff in the Co-op Members\' Freeshop\n- Join co-op meetings and have a say in how the Shrub develops\n- Be part of an active community of change-makers\n- Member only monthly parties!\n\nWe hope that you\'ll take this time to renew your membership and remain a part of our community. It couldn\'t be easier - just [click here](https://www.shrubcoop.org/become-a-member/) to renew!\n\nKind regards,\n\nShrub Co-op'),
(0, 'renewed', 'Sent when member renews their membership', 'You Renewed Your Membership!', '<p>Hey, |first_name|!</p><p>Thanks for renewing your membership with us!</p><p>Shrub Co-op</p>', 'Hey, |first_name|!\n\nThanks for renewing your membership with us!\n\nShrub Co-op');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `member_id` varchar(11) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(89) NOT NULL,
  `phone_no` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `is_member` tinyint(1) NOT NULL,
  `free` tinyint(1) NOT NULL,
  `volunteer_status` tinyint(1) NOT NULL,
  `first_volunteered` date DEFAULT NULL,
  `last_volunteered` date DEFAULT NULL,
  `working_groups` text,
  `active_swapper` tinyint(1) NOT NULL,
  `balance` int(10) NOT NULL,
  `earliest_membership_date` date NOT NULL,
  `current_init_membership` date NOT NULL,
  `current_exp_membership` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset`
--

CREATE TABLE `password_reset` (
  `user_id` varchar(50) NOT NULL,
  `ip_address` varchar(39) NOT NULL,
  `reset_code` varchar(25) NOT NULL,
  `date_issued` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `stock_categories`
--

CREATE TABLE `stock_categories` (
  `item_id` varchar(10) NOT NULL,
  `till_id` varchar(25) DEFAULT NULL,
  `carbon_id` varchar(6) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `value` float DEFAULT NULL,
  `allowTokens` tinyint(4) NOT NULL DEFAULT '1',
  `action` varchar(20) DEFAULT NULL,
  `parent` varchar(10) DEFAULT NULL,
  `active` tinyint(4) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tills`
--

CREATE TABLE `tills` (
  `till_id` varchar(25) NOT NULL,
  `group_id` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `stockControl` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `till_activity`
--

CREATE TABLE `till_activity` (
  `action_id` varchar(25) NOT NULL,
  `till_id` varchar(25) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expected_float` float DEFAULT NULL,
  `counted_float` float NOT NULL,
  `note` text NOT NULL,
  `opening` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` varchar(30) NOT NULL,
  `till_id` varchar(25) DEFAULT NULL,
  `user_id` varchar(25) DEFAULT NULL,
  `member_id` varchar(15) DEFAULT NULL,
  `date` datetime NOT NULL,
  `summary` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer_hours`
--

CREATE TABLE `volunteer_hours` (
  `shift_id` varchar(11) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `date` date NOT NULL,
  `duration_as_decimal` float NOT NULL,
  `working_group` varchar(10) NOT NULL,
  `approved` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `volunteer_info`
--

CREATE TABLE `volunteer_info` (
  `member_id` varchar(11) NOT NULL,
  `emergencyContactRelation` varchar(25) NOT NULL,
  `emergencyContactName` varchar(25) DEFAULT NULL,
  `emergencyContactPhoneNo` varchar(15) NOT NULL,
  `roles` text NOT NULL,
  `hoursPerWeek` int(11) NOT NULL,
  `survey` text NOT NULL,
  `availability` text NOT NULL,
  `dateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `working_groups`
--

CREATE TABLE `working_groups` (
  `group_id` varchar(12) NOT NULL,
  `prefix` varchar(10) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `parent` varchar(12) DEFAULT NULL,
  `rate` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `working_groups`
--

INSERT INTO `working_groups` (`group_id`, `prefix`, `name`, `parent`, `rate`) VALUES
('WG-100', 'the', 'Swapshop', NULL, 3),
('WG-101', NULL, 'Food Sharing', NULL, 0),
('WG-101-001', NULL, 'Food Sharing: Events Volunteers', 'WG-101', 0),
('WG-101-002', NULL, 'Food Sharing: Research Volunteers', 'WG-101', 0),
('WG-102', NULL, 'Finance & Admin', NULL, 3),
('WG-103', NULL, 'Welfare', NULL, 5),
('WG-104', NULL, 'Zero Waste Advocate Network', NULL, 0),
('WG-105', 'the', 'Wee Spoke Hub', NULL, 3),
('WG-106', NULL, 'Workshops', NULL, 0),
('WG-107', NULL, 'Governance & Policy', NULL, 0),
('WG-108', NULL, 'Communications & Outreach', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `working_group_requests`
--

CREATE TABLE `working_group_requests` (
  `request_id` varchar(11) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `working_group` varchar(10) NOT NULL,
  `verified` tinyint(1) DEFAULT NULL,
  `time_requested` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD PRIMARY KEY (`token`);

--
-- Indexes for table `attempts`
--
ALTER TABLE `attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `carbon`
--
ALTER TABLE `carbon`
  ADD PRIMARY KEY (`transaction_id`);

--
-- Indexes for table `carbon_categories`
--
ALTER TABLE `carbon_categories`
  ADD PRIMARY KEY (`carbon_id`);

--
-- Indexes for table `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `mail_templates`
--
ALTER TABLE `mail_templates`
  ADD PRIMARY KEY (`mail_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`member_id`);

--
-- Indexes for table `password_reset`
--
ALTER TABLE `password_reset`
  ADD PRIMARY KEY (`reset_code`);

--
-- Indexes for table `stock_categories`
--
ALTER TABLE `stock_categories`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `tills`
--
ALTER TABLE `tills`
  ADD PRIMARY KEY (`till_id`),
  ADD UNIQUE KEY `till_id` (`till_id`);

--
-- Indexes for table `till_activity`
--
ALTER TABLE `till_activity`
  ADD PRIMARY KEY (`action_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`);

--
-- Indexes for table `volunteer_hours`
--
ALTER TABLE `volunteer_hours`
  ADD PRIMARY KEY (`shift_id`);

--
-- Indexes for table `volunteer_info`
--
ALTER TABLE `volunteer_info`
  ADD PRIMARY KEY (`member_id`);

--
-- Indexes for table `working_groups`
--
ALTER TABLE `working_groups`
  ADD PRIMARY KEY (`group_id`);

--
-- Indexes for table `working_group_requests`
--
ALTER TABLE `working_group_requests`
  ADD PRIMARY KEY (`request_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attempts`
--
ALTER TABLE `attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=600;
--
-- AUTO_INCREMENT for table `global_settings`
--
ALTER TABLE `global_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
