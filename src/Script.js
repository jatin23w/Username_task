// // Define the elements
const searchInput = document.getElementById('searchInput');
const tableBody = document.querySelector('table tbody');
const loadingIndicator = document.getElementById('loadingIndicator');

// Add an input event listener with debouncing
searchInput.addEventListener('input', debounce(searchGitHubUsers, 300));

function debounce(func, delay) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, arguments);
        }, delay);
    };
}

function searchGitHubUsers() {
    const username = searchInput.value.trim();

    // Clear previous search results
    tableBody.innerHTML = '';

    // Show loading indicator
    loadingIndicator.style.display = 'block';

    if (username === '') {
        // Hide loading indicator when the input is empty
        loadingIndicator.style.display = 'none';
        return;
    }

    const accessToken = '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'; // Replace with your actual token

    // Use the template literal to correctly interpolate the username
    fetch(`https://api.github.com/search/users?q=${username}&sort=followers`, {
        method: 'GET',
        headers: {
            Authorization: `token ${accessToken}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const users = data.items;
            users.forEach(user => {
                // Fetch user details, including followers count
                fetch(`https://api.github.com/users/${user.login}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `token ${accessToken}`,
                    },
                })
                    .then(response => response.json())
                    .then(userDetails => {
                        const row = `<tr>
                                        <td>${userDetails.login}</td>
                                        <td>${userDetails.followers}</td>
                                    </tr>`;
                        tableBody.innerHTML += row;
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });
            // Hide loading indicator when data is loaded
            loadingIndicator.style.display = 'none';
        })
        .catch(error => {
            // Handle errors and display a message
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="2">Error fetching data from GitHub API</td></tr>`;
            // Hide loading indicator on error
            loadingIndicator.style.display = 'none';
        });
}
