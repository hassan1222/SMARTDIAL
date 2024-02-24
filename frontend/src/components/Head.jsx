import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { Box, Button, Typography } from '@mui/material';
import { Home, ExitToApp, Person } from '@mui/icons-material';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <header className="header">
      <Box className="logo">
        <Link to="/">Smart Dial</Link>
      </Box>
      <ul>
        {user ? (
          <li>
            <Button className="btn" onClick={onLogout} startIcon={<ExitToApp />}>
              Logout
            </Button>
          </li>
        ) : (
          <>
            <li>
              <Link to="/loginAdm">
                <Button startIcon={<Person />}>Admin</Button>
              </Link>
            </li>
            <li>
              <Link to="/loginEmp">
                <Button startIcon={<Person />}>Employee</Button>
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
}

export default Header;