const getStoredToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');

export default getStoredToken;
