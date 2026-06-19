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
    <h2>Hello <?php echo e($name); ?>,</h2>

    <p>Thank you for your order! Here are your order details:</p>

    <p><strong>Email:</strong> <?php echo e($email); ?></p>
    <p><strong>Governorate:</strong> <?php echo e($governorate); ?></p>
    <p><strong>Phone:</strong> <?php echo e($phone); ?></p>
    <p><strong>Payment Method:</strong> <?php echo e($payment_method); ?></p>
    <p><strong>Status:</strong> <?php echo e($status); ?></p>

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
            <?php $__currentLoopData = $products; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($product['id']); ?></td>
                    <td><?php echo e($product['name']); ?></td>
                    <td><?php echo e($product['price']); ?></td>
                    <td><?php echo e($product['quantity']); ?></td>
                    <td><?php echo e($product['subtotal']); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
    </table>

    <p><strong>Total Price:</strong> <?php echo e($total_price); ?> EGP</p>

    <div class="footer">
        <p>Best regards,<br>
        Clothes Brand Team</p>
    </div>
</div>
</body>
</html>
<?php /**PATH D:\FULL STACK\Laravel\MyProject\clothes\resources\views/Mails/contact.blade.php ENDPATH**/ ?>