import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../redux/slices/cartSlice'; // We'll define this later if not already done
import products from '../data/products.json';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Paper,
  Box,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

// Styled TableCell for header
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state) => state.cart);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Your Cart
      </Typography>
      {items.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Your cart is empty
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Product</StyledTableCell>
                  <StyledTableCell align="center">Quantity</StyledTableCell>
                  <StyledTableCell align="center">Price</StyledTableCell>
                  <StyledTableCell align="center">Total</StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <TableRow key={item.productId} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell component="th" scope="row">
                        {product.name}
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="center">${item.price}</TableCell>
                      <TableCell align="center">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => dispatch(removeFromCart(item.productId))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Total: ${total.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="large"
              href="/user#payment"
              sx={{ borderRadius: 20, textTransform: 'none', px: 4 }}
            >
              Proceed to Payment
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Cart;