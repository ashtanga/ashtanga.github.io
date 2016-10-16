if (loggator()) {
	// Append button
	var surya = document.createElement('button');
	surya.innerHTML = 'Surya Namascara';
	document.querySelector('footer').appendChild(surya);
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
			var cnt = atob(l.content);
			var newDate = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
			var newfile = cnt + newDate + "\n";
			var requestData = {
				message: 'Update practice.csv by button',
				sha: sha,
				content: btoa(newfile)
			};
			return fetch('https://api.github.com/repos/ashtanga/ashtanga.github.io/contents/practice.csv',{
				method: 'PUT',
				headers: {
					Authorization: 'token ' + atob(localFnp.token),
					Accept: 'application/vnd.github.v3.full+json'
				},
				body: JSON.stringify(requestData)
			});
		}
	).then(window.location.reload());
}
