<?php
include 'db.php';

if (isset($_COOKIE['userId'])) {
	header('Location: index.html');
    return;
}

// No userId set. Get them an ID, and then have them go to the welcome screen to
// pick a name.

// expire in 30 days
setcookie('userId', createUser(), time()+60*60*24*30);

header('Location: welcome.html');
exit();
?>
