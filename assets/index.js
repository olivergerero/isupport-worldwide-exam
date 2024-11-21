const API_KEY = 'csv4vp9r01qq28mn1g60csv4vp9r01qq28mn1g6g';  // Your provided Finnhub API Key
let isFirstFetch = true;  // Flag to check if it's the first API call

// Variables to store the previous prices
let googlePreviousPrice = null;
let applePreviousPrice = null;

// Chart data and options setup for Google
const googleChart = new Chart(document.getElementById('googleChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: '',
            borderColor: 'rgba(75, 192, 192, 1)',
            data: [],
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                display: false
            },
            y: {
                beginAtZero: false
            }
        }
    }
});

// Chart data and options setup for Apple
const appleChart = new Chart(document.getElementById('appleChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: '',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                display: false
            },
            y: {
                beginAtZero: false
            }
        }
    }
});

// Fetch stock data and update the UI and chart
async function updateStockData(symbol, chart, priceElement, timeElement, percentageChangeElement, previousPrice) {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
            params: {
                symbol: symbol,
                token: API_KEY
            }
        });

        const price = response.data.c;  // Current price
        const time = new Date().toLocaleTimeString();  // Current time

        // Update HTML for price and last update
        priceElement.innerHTML = `$${price.toFixed(2)}`;
        timeElement.innerHTML = `Last Update: ${time}`;

        // Calculate percentage change and display
        if (previousPrice !== null) {
            const percentageChange = ((price - previousPrice) / previousPrice) * 100;  // Calculate percentage change
            percentageChangeElement.innerHTML = `${percentageChange.toFixed(2)}%`;

            // Display percentage change and style based on the change
            if (percentageChange > 0) {
                percentageChangeElement.style.color = 'green';  // Green for positive change
            } else {
                percentageChangeElement.style.color = 'red';  // Red for negative change
            }
        }

        // Update chart data
        const currentTime = new Date().toLocaleTimeString();
        chart.data.labels.push(currentTime);
        chart.data.datasets[0].data.push(price);

        // Keep only the last 30 data points on the chart
        if (chart.data.labels.length > 30) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update();

        // Show the "New Data Just Came In" label only after the first fetch
        if (!isFirstFetch) {
            const newDataLabel = document.getElementById('newDataLabel');
            newDataLabel.style.opacity = '1';

            // Hide the "New Data Just Came In" label after 5 seconds
            setTimeout(() => {
                newDataLabel.style.opacity = '0';
            }, 5000);
        }

        // Set isFirstFetch to false after the initial fetch
        isFirstFetch = false;

        // Return the current price as the previous price for the next fetch
        return price;

    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

// Update stock data every 10 seconds for both Google and Apple
setInterval(async () => {
    googlePreviousPrice = await updateStockData('GOOGL', googleChart, document.getElementById('googlePrice'), document.getElementById('googleTime'), document.getElementById('googlePercentageChange'), googlePreviousPrice);
    applePreviousPrice = await updateStockData('AAPL', appleChart, document.getElementById('applePrice'), document.getElementById('appleTime'), document.getElementById('applePercentageChange'), applePreviousPrice);
}, 60000); // 10 seconds interval

// Initial fetch of stock data (will not show the new data label)
(async () => {
    googlePreviousPrice = await updateStockData('GOOGL', googleChart, document.getElementById('googlePrice'), document.getElementById('googleTime'), document.getElementById('googlePercentageChange'), googlePreviousPrice);
    applePreviousPrice = await updateStockData('AAPL', appleChart, document.getElementById('applePrice'), document.getElementById('appleTime'), document.getElementById('applePercentageChange'), applePreviousPrice);
})();

// Manual refresh button click event
document.getElementById('refreshButton').addEventListener('click', async () => {
    googlePreviousPrice = await updateStockData('GOOGL', googleChart, document.getElementById('googlePrice'), document.getElementById('googleTime'), document.getElementById('googlePercentageChange'), googlePreviousPrice);
    applePreviousPrice = await updateStockData('AAPL', appleChart, document.getElementById('applePrice'), document.getElementById('appleTime'), document.getElementById('applePercentageChange'), applePreviousPrice);
});