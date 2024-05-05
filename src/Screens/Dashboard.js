import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { auth } from '../Config/firebase';
import CustomSidebar from "../Components/CustomSidebar";
import Loader from "../Components/Loader";
import "../css/customSidebar.css";
import '../App.css';
import "../css/loader.css";
import "../css/dashboard.css";
import { Paginator } from 'primereact/paginator';

function Dashboard() {
  // User and admin data

  const cardData = [
    { title: "Happiness", totalPoems: 10 },
    { title: "Sadness", totalPoems: 10 },
    { title: "Fear", totalPoems: 10 },
    { title: "Anger", totalPoems: 10 },
    { title: "Surprise", totalPoems: 10 },
    { title: "Disgust", totalPoems: 10 }
  ];


  const userData = [
    { id: 1, name: "User 1", type: "user" },
    { id: 2, name: "User 2", type: "user" },
    { id: 3, name: "User 3", type: "user" },
    { id: 4, name: "User 4", type: "user" },
    { id: 5, name: "User 5", type: "user" },
    { id: 6, name: "User 6", type: "user" },
    { id: 7, name: "User 7", type: "user" },
    { id: 8, name: "User 8", type: "user" },
    { id: 9, name: "User 9", type: "user" },
    { id: 10, name: "User 10", type: "user" },
    { id: 11, name: "User 11", type: "user" },
    { id: 12, name: "User 12", type: "user" },
    { id: 13, name: "User 13", type: "user" },
    { id: 14, name: "User 14", type: "user" },
    { id: 15, name: "User 15", type: "user" },
    { id: 16, name: "User 16", type: "user" },
    { id: 17, name: "User 17", type: "user" },
    { id: 18, name: "User 18", type: "user" },
    { id: 19, name: "User 19", type: "user" },
    { id: 20, name: "User 20", type: "user" }
  ];
  
  const adminData = [
    { id: 1, name: "Admin 1", type: "admin" },
    { id: 2, name: "Admin 2", type: "admin" },
    { id: 3, name: "Admin 3", type: "admin" },
    { id: 4, name: "Admin 4", type: "admin" },
    { id: 5, name: "Admin 5", type: "admin" },
    { id: 6, name: "Admin 6", type: "admin" },
    { id: 7, name: "Admin 7", type: "admin" },
    { id: 8, name: "Admin 8", type: "admin" },
    { id: 9, name: "Admin 9", type: "admin" },
    { id: 10, name: "Admin 10", type: "admin" },
    { id: 11, name: "Admin 11", type: "admin" },
    { id: 12, name: "Admin 12", type: "admin" },
    { id: 13, name: "Admin 13", type: "admin" },
    { id: 14, name: "Admin 14", type: "admin" },
    { id: 15, name: "Admin 15", type: "admin" },
    { id: 16, name: "Admin 16", type: "admin" },
    { id: 17, name: "Admin 17", type: "admin" },
    { id: 18, name: "Admin 18", type: "admin" },
    { id: 19, name: "Admin 19", type: "admin" },
    { id: 20, name: "Admin 20", type: "admin" }
  ];
  
  return (
    <>
          <div className="row flex-wrap justify-content-around mx-2">
        {cardData.map((card, index) => (
          <div key={index} className="col-lg-2 col-md-4 my-2">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text">Total Poems: {card.totalPoems}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="row mx-2 mt-4">
        <div className="col">
          <div className="card">
            <div className="card-header">User List</div>
            <div className="card-body">
              <DataTable value={userData} paginator rows={5} className="p-datatable-sm">
                <Column field="id" header="ID"></Column>
                <Column field="name" header="Name"></Column>
                <Column field="type" header="Type"></Column>
              </DataTable>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-header">Admin List</div>
            <div className="card-body">
              <DataTable value={adminData} paginator rows={5} className="p-datatable-sm">
                <Column field="id" header="ID"></Column>
                <Column field="name" header="Name"></Column>
                <Column field="type" header="Type"></Column>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
