export function getUserId() {
	const id = document.cookie.match(/(?:^|;)\s*userId\s*=\s*([^;]+)\s*(?:$|;)/)?.[1]
	if (!id) {
		window.location.href = '/index.php'
	}
	return parseInt(id)
}
