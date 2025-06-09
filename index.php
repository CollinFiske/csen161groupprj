<?php
include 'db.php';

if (isset($_COOKIE['userId'])) {
	header('Location: index.html');
}

// No userId set. Get them an ID, and then have them go to the welcome screen to
// pick a name.


setcookie('userId', createUser());

header('Location: welcome.html');
exit();
?>
