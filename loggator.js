function b64e(str) {
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
		return String.fromCharCode('0x' + p1);
	}));
}

function b64d(str) {
	return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
		return '%' + c.charCodeAt(0).toString(16);
	}).join(''));
}

function create (tagname, attributes, content) {
	var element = document.createElement(tagname),
	property;
	// element attributes
	if(typeof attributes == "object") {
		for(property in attributes) {
			if(attributes.hasOwnProperty(property)) {
				element.setAttribute(property, attributes[property]);
			}
		}
	}
	if (typeof attributes === "string") { content = attributes; }
	if(content) { element.innerHTML = content; }
	return element;
}

Element.prototype.acc = function (input) {
	if (input.constructor === Array) {
		for (var i = 0; i < input.length; i++) {
			if(input[i]) this.appendChild(input[i]);
		}
	} else if (input.constructor) {
		this.appendChild(input);
	}
	return this;
};

Storage.prototype.setObject = function(key, value) {
	this.setItem(key, b64e(JSON.stringify(value)));
};

Storage.prototype.getObject = function(key) {
	var value = this.getItem(key);
	return value && JSON.parse(b64d(value));
};

function checkLogin (response) {
	if (response.status !== 200) {
		// Unauthorized or bad credential
		localStorage.removeItem('fnp');
		return false;
	} else {
		// logged, set logout button
		var loginButton = document.getElementById('login_button'),
			loginForm = document.getElementById("login_form");
		loginButton.removeEventListener("click", createLoginForm, false);
		// reset login form
		if (loginForm) loginForm.parentNode.appendChild(
			create('div', {class:'flash'}, 'You are logged in: <a href="' + window.location + '">Reload</a>')
		); else {
			loginButton.innerHTML = 'Logout';
			loginButton.addEventListener("click", logout, false);
		}
		return true;
	}
}

function logout (event) {
	event.preventDefault();
	localStorage.removeItem('fnp');
	var loginButton = document.getElementById('login_button');
	loginButton.removeEventListener("click", logout, false);
	document.getElementById('login_form_div').appendChild(
		create('div', {class:'flash'}, 'You are logged out: <a href="' + window.location + '">Reload</a>')
	);
}

// Error callback
function errore (e) {
	return console.log('error: ' + e);
}

function getAuth (token) {
	var localFnp = localStorage.getObject('fnp') || {};
	localFnp.token = btoa(token);
	localStorage.setObject('fnp', localFnp);
	return fetch('https://api.github.com/user', {
		headers: { Authorization: 'token ' + token}
	}).then(checkLogin).catch(errore);
}

function serveLoginForm (event) {
	event.preventDefault();
	var tokenField = document.getElementById('token_field');
	if (tokenField.value.length === 40) {
		getAuth(tokenField.value);
	} else if (tokenField.value.length > 0) {
		tokenField.parentNode.appendChild(create('div', {class:'flash'}, 'Invalid token'));
	}
	tokenField.value = '';
}

function toggleLoginForm () {
	var loginFormDiv = document.getElementById("login_form_div");
	loginFormDiv.style.display = (window.getComputedStyle(loginFormDiv).getPropertyValue('display') === 'block') ? 'none' : 'block';
}

function createLoginForm (event) {
	event.preventDefault();
	if (!document.getElementById('login_form')) {
		// create form
		var formElement = create('form',{id:'login_form'});
		// populate and add event
		formElement.acc([
			create('label', 'Paste your personal token: '),
			create('input', {type: 'password', id: 'token_field'}),
			create('input', {type: 'submit', id: 'submit_button', value: 'Login'})
		]).addEventListener("submit", serveLoginForm);

		// append formElement
		if (document.getElementById('login_form_div').appendChild(formElement)) {
			document.getElementById('login_button').addEventListener("click", toggleLoginForm, false);
		}
	}
}

var loggator = function () {
	// create form
	var loginButtonDiv = document.getElementById('login_button_div') ||
		document.body.appendChild(create('div', {id:'login_button_div'})),
		loginFormDiv = document.getElementById('login_form_div') || document.body.appendChild(create('div', {id:'login_form_div'})),
		loginButton = document.getElementById('login_button') || loginButtonDiv.appendChild(create('a', {id:'login_button',href:'#'}, 'Login')),
		localFnp = localStorage.getObject('fnp');
	// create login event
	loginButton.addEventListener("click", createLoginForm, false);
	// check token and return
	return (localFnp && localFnp.token) ? getAuth(atob(localFnp.token)) : 0;
};
