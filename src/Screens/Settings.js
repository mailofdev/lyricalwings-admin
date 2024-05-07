import React, { useState } from 'react';
import { emailPasswordSignUp, emailPasswordLogin } from '../Config/firebase';
import Loader from '../Components/Loader';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Paginator } from 'primereact/paginator';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddUserView, setShowAddUserView] = useState(false);
  const [users, setUsers] = useState([]); // Assuming this will contain user data
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await emailPasswordSignUp(email, password);
      // You can add additional logic here, such as redirecting the user to another page after successful sign-up
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await emailPasswordLogin(email, password);
      // You can add additional logic here, such as redirecting the user to another page after successful sign-in
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onAddUserClick = () => {
    setShowAddUserView(true);
  };

  const onHideAddUserView = () => {
    setShowAddUserView(false);
  };

  const addUserView = (
    <>
      <div className='p-4 border m-4 d-flex gap-4 flex-column shadow card'>
      <div className='flex-row d-flex gap-4'>
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className='flex-row d-flex justify-content-end gap-4'>
        <button onClick={onHideAddUserView} className="btn btn-light btn-outline-danger border border-1 border-danger">
          cancel
        </button>
        <button onClick={handleSignUp} className="align-self-center d-flex justify-content-center btn btn-light btn-outline-success border border-1 border-success">
          Add user
        </button>
      </div>
      </div>
    </>
  );

  const itemTemplate = (user) => {
    // Adjust this based on your user data structure
    return (
      <div className="p-col-12">
        {/* Render user data here */}
        <div>{user.name}</div>
        <div>{user.email}</div>
      </div>
    );
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const searchUsers = (event) => {
    // Implement search functionality here
  };

  return (
    <div className='d-flex justify-content-center align-items-center'>
    <div className='m-4 p-4 w-75 shadow card'>
    <div className='d-flex justify-content-center align-items-center'>
      <div className='row flex-row d-flex gap-4 w-75'>
        <div className='col'>
          <InputText
            type="text"
            placeholder="Search Users"
            onChange={searchUsers}
            className="form-control"
          />
        </div>
        <div className='col-4'>
          <button onClick={onAddUserClick} className="align-self-center d-flex justify-content-center btn btn-light btn-outline-success border border-1 border-success">
            Add User
          </button>
        </div>
      </div>
      </div>

      {showAddUserView && addUserView}
      <div className="p-grid">
        <DataView
          value={users}
          layout={'list'} // You can change layout to grid if needed
          itemTemplate={itemTemplate}
          paginator
          paginatorPosition="bottom"
          rows={rows}
          first={first}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
        />
      </div>
      {loading && <Loader loadingMessage="Processing..." />}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
    </div>
  );
};

export default Settings;
