if (loggator()) {
	// Append Today button
	var surya = document.createElement('button');
	surya.innerHTML = 'Today';
	surya.id = 'snButton';
	// Insert in footer
	// document.querySelector('footer').appendChild(surya);
	// insert in main
	// document.querySelector('main').insertBefore(surya,document.getElementById('years'));
	document.getElementById('commands').appendChild(surya);
	// Retrieve token
	var localFnp = localStorage.getObject('fnp');
	surya.addEventListener('click', practice);
	// Append Yesterday button
	var suryaye = document.createElement('button');
	suryaye.innerHTML = 'Yesterday';
	suryaye.id = 'yeButton';
	// DEBUG: DONT SHOW YESTERDAY BUTTON
	// document.querySelector('footer').appendChild(suryaye);
	// Add listener
	suryaye.addEventListener('click', function(e) { practice(e, true); }, false );
}

function practice (e, yesterday) {
	yesterday = yesterday || false;
	if(e) e.preventDefault();
	fetch('https://api.github.com/repos/ashtanga/ashtanga.github.io/contents/_data/practice.csv',{
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
			var date = new Date();
			var giornoPratica = (yesterday) ? date.setDate(date.getDate() - 1) : date;
			var newDate = giornoPratica.getFullYear() + '-' + ('0' + (giornoPratica.getMonth() + 1)).slice(-2) + '-' + ('0' + giornoPratica.getDate()).slice(-2);
			var newfile = cnt + newDate + "\n";
			var requestData = {
				message: 'Update practice.csv by button',
				sha: sha,
				content: btoa(newfile)
			};
			return fetch('https://api.github.com/repos/ashtanga/ashtanga.github.io/contents/_data/practice.csv',{
				method: 'PUT',
				headers: {
					Authorization: 'token ' + atob(localFnp.token),
					Accept: 'application/vnd.github.v3.full+json'
				},
				body: JSON.stringify(requestData)
			}).then(
				function(r){
					return r.json();
				}
			).then(
				function(payload){
					if(payload.commit.sha.length == 40){
						var oldurl = window.location.origin;
						window.location.href = oldurl + '/#' + payload.commit.sha;
						window.location.reload();
					}
				}
			).catch(console.log);
		}
	);
}
