import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice'; // We'll define this later if not already done
import products from '../data/products.json';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled component for hover effect
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  },
}));

const ProductCatalog = () => {
  const dispatch = useDispatch();

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Fit-Gain Product Catalog
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <StyledCard>
              <CardMedia
                component="img"
                height="140"
                image={`https://via.placeholder.com/150?text=${product.name}`} // Placeholder image
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="h6" color="primary">
                    ${product.price}
                  </Typography>
                  <Chip
                    label={product.category}
                    color={product.category === 'equipment' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() =>
                    dispatch(addToCart({ productId: product.id, quantity: 1, price: product.price }))
                  }
                  sx={{ borderRadius: 20, textTransform: 'none' }}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductCatalog;