import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

const PaymentMethodCard = ({ method, onRemove }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">
          {method.methodType === 'bank_transfer' ? 'Bank Transfer' : method.methodType.replace('_', ' ').toUpperCase()}
        </Typography>
        <Typography>
          {method.cardNumberLastFour ? `Ending in ${method.cardNumberLastFour}` : `Account ending in ${method.bankAccountNumberLastFour}`}
        </Typography>
        <Typography>{method.isDefault ? 'Default' : ''}</Typography>
        <Button variant="outlined" color="error" onClick={() => onRemove(method._id)} sx={{ mt: 1 }}>
          Remove
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;