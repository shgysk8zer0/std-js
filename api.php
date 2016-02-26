<?php
set_include_path(dirname(__DIR__));
spl_autoload_register('spl_autoload');
header('Content-type: application/json');
\shgysk8zer0\Core\console::getInstance()->asErrorHandler()->asExceptionHandler();
$notification = new \shgysk8zer0\Core\Notification('Title');
$notification->body = 'Hello World!';
$notification->icon = 'javascript.svg';
$notification->sticky = true;
$notification->lang('en')->dir('ltr');
exit($notification);
