function generateAuctionEmail(title, MinimumPrice) {
  return `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { padding: 20px; }
                .header { background-color: #007bff; color: white; padding: 10px; text-align: center; }
                .content { margin-top: 20px; }
                .footer { margin-top: 20px; font-size: 12px; color: gray; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Auction Update: ${title}</h2>
                </div>
                <div class="content">
                    <p>Hello Customer>
                    <p>The auction <strong>${title}</strong> is ending soon!</p>
                    <p>Starting Bidding Price: <strong>$${MinimumPrice}</strong></p>
                    <p>Bid now to secure your chance to win.</p>
                    
                </div>
                <div class="footer">
                    <p>You are receiving this email because you subscribed to auction notifications.</p>
                    <p><a href="#">Unsubscribe</a></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = { generateAuctionEmail };
