import React from 'react';
import { Container, AppBar, Toolbar, Typography } from '@mui/material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const title = "JINGJAI Insurance Assistant";
    return (
      <Container maxWidth={false} disableGutters>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">{title}</Typography>
          </Toolbar>
        </AppBar>
        <main>{children}</main>
        <footer>
          <Typography variant="body2" color="lightGrey" align="center">
            © {new Date().getFullYear()} {title} Application
          </Typography>
        </footer>
      </Container>
    );
};

export default Layout;