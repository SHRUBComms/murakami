-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Sep 18, 2018 at 05:12 PM
-- Server version: 5.7.23-0ubuntu0.16.04.1
-- PHP Version: 7.0.30-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `murakami_dev`
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
  `user_id` varchar(11) NOT NULL,
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
  `member_id` varchar(11) NOT NULL,
  `trans_object` text NOT NULL,
  `trans_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `global_settings`
--

CREATE TABLE `global_settings` (
  `id` int(11) NOT NULL,
  `token` varchar(20) NOT NULL,
  `definitions` text NOT NULL,
  `hourly_rate` int(11) NOT NULL,
  `password_reset` tinyint(1) NOT NULL,
  `can_add_members` tinyint(1) NOT NULL
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
  `admin` tinyint(4) NOT NULL DEFAULT '0',
  `admin_wg` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`id`, `username`, `first_name`, `last_name`, `email`, `password`, `admin`, `admin_wg`, `created_at`) VALUES
('01746919992', 'test.admin', 'Test', 'Admin', 'hello@rosshudson.co.uk', '$2a$10$s/TIShnWvvCx9GHGphyyDuzRQkPqhGSrM.SZk32EkVbE/KmQagsse', 1, '["WG-100",\n"WG-101",\n"WG-101-001",\n"WG-103",\n"WG-105",\n"WG-106",\n"WG-107",\n"WG-108"]', '2018-05-24 23:02:28');

-- --------------------------------------------------------

--
-- Table structure for table `mail_templates`
--

CREATE TABLE `mail_templates` (
  `active` tinyint(4) NOT NULL DEFAULT '1',
  `mail_id` varchar(50) NOT NULL,
  `mail_desc` text NOT NULL,
  `subject` text NOT NULL,
  `markup` longtext NOT NULL,
  `plaintext` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` varchar(30) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `transaction_type` varchar(3) NOT NULL,
  `categories` text,
  `amount` varchar(5) NOT NULL,
  `comment` text,
  `transaction_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
-- Table structure for table `working_group_requests`
--

CREATE TABLE `working_group_requests` (
  `request_id` varchar(11) NOT NULL,
  `member_id` varchar(11) NOT NULL,
  `working_group` varchar(6) NOT NULL,
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
-- Indexes for table `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_2` (`id`,`username`,`email`),
  ADD KEY `id` (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;
--
-- AUTO_INCREMENT for table `global_settings`
--
ALTER TABLE `global_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
