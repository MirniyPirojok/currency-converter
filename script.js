document.getElementById('converter-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Retrieve form values
    const incomeCurrency = document.getElementById('income-currency').value.toUpperCase();
    const income = parseFloat(document.getElementById('income').value);
    const incomeDate = document.getElementById('income-date').value;
    const yearlyIncomeGEL = parseFloat(document.getElementById('yearly-income').value) || 0;

    if (!income || !incomeCurrency || !incomeDate) {
        alert("Please fill all fields correctly.");
        return;
    }

    try {
        const formattedDate = formatDate(incomeDate);
        // Fetch currency rate
        const response = await fetch(`https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/?currencies=${incomeCurrency}&date=${formattedDate}`);

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        const exchangeRate = data[0]?.currencies[0]?.rate;
        const quantity = data[0]?.currencies[0]?.quantity;

        if (!exchangeRate || !quantity) {
            throw new Error('Currency not found');
        }

        // Calculate converted amount
        const convertedAmount = income / quantity * exchangeRate;
        const totalYearlyIncome = yearlyIncomeGEL + convertedAmount;

        // Display results
        document.getElementById('converted-amount').textContent = convertedAmount.toFixed(2);
        document.getElementById('total-yearly-income').textContent = totalYearlyIncome.toFixed(2);

    } catch (error) {
        console.error('Error fetching currency data:', error);
        alert('Error fetching currency data. Please check your inputs or try again later.');
    }

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    document.getElementById('converted-amount').addEventListener('click', (event) => {
        copyToClipboard(event);
    });
    
    document.getElementById('total-yearly-income').addEventListener('click', (event) => {
        copyToClipboard(event);
    });
    
    function copyToClipboard(event) {
        navigator.clipboard.writeText(event.target.textContent).then(() => {
            const convertedAmountMsgEl = document.getElementById('converted-amount-msg');
            const totalYearlyIncomeMsgEl = document.getElementById('total-yearly-income-msg');
            const msgEl = event.target.id === 'converted-amount' ? convertedAmountMsgEl : totalYearlyIncomeMsgEl;
        
            // show message "Copied" for 2 seconds
            msgEl.style.display = 'inline';
            setTimeout(() => {
                msgEl.style.display = 'none';
            }, 2000);

        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
});
