<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order Status</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f9f9f9;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
        }
        h2 { color: #333333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        table, th, td { border: 1px solid #dddddd; }
        th, td { padding: 10px; text-align: left; }
        th { background: #f2f2f2; }
        .footer { margin-top: 20px; font-size: 14px; color: #555; }
    </style>
</head>
<body>
<div class="container">
    <h2>Hello {{ $name }},</h2>

    <p>Thank you for your order! Here are your order details:</p>

    <p><strong>Email:</strong> {{ $email }}</p>
    <p><strong>Governorate:</strong> {{ $governorate }}</p>
    <p><strong>Phone:</strong> {{ $phone }}</p>
    <p><strong>Payment Method:</strong> {{ $payment_method }}</p>
    <p><strong>Status:</strong> {{ $status }}</p>

    <h3>Products Ordered:</h3>
    <table>
        <thead>
            <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Price (EGP)</th>
                <th>Quantity</th>
                <th>Subtotal (EGP)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
                <tr>
                    <td>{{ $product['id'] }}</td>
                    <td>{{ $product['name'] }}</td>
                    <td>{{ $product['price'] }}</td>
                    <td>{{ $product['quantity'] }}</td>
                    <td>{{ $product['subtotal'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p><strong>Total Price:</strong> {{ $total_price }} EGP</p>

    <div class="footer">
        <p>Best regards,<br>
        Clothes Brand Team</p>
    </div>
</div>
</body>
</html>
