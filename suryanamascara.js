if (loggator()) {
	// Append button
	var surya = document.createElement('button');
	surya.innerHTML = 'Surya Namascara';
	document.body.appendChild(surya);
	// Retrieve token
	var localFnp = localStorage.getObject('fnp');
	surya.addEventListener('click', practice);
}

function practice (e) {
	e.preventDefault();
	fetch('https://api.github.com/repos/ashtanga/ashtanga.github.io/contents/practice.csv',{
		method: 'GET',
		headers: {
			Authorization: 'token ' + atob(localFnp.token),
			Accept: 'application/vnd.github.v3.full+json'
		}
	}).then(
		function (r) { return r.json(); }
	).then(
		function (l) {
			var sha = l.sha;
			return atob(l.content);
		}
	).then(
		function (c) {
			var newDate = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
			return (c + newDate);
		}
	).then(
		function (n) {
			// console.log(btoa(n));
			return fetch('https://api.github.com/repos/ashtanga/ashtanga.github.io/contents/practice.csv',{
				method: 'POST',
				headers: {
					Authorization: 'token ' + atob(localFnp.token),
					Accept: 'application/vnd.github.v3.full+json'
				},
				message: 'Update practice.csv by button',
				sha: sha,
				content: btoa(n)
			});
		}
	).then(window.location.reload());
}
