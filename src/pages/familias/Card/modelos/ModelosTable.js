import React, {useEffect, useState} from "react";
import { Grid } from "@material-ui/core";
import MUIDataTable from "mui-datatables";


export default function ModelosTable() {

  const [datatableData,setDatatableData] = useState( [
    ["Joe James", "Example Inc.", "Yonkers", "NY"],
    ["John Walsh", "Example Inc.", "Hartford", "CT"],
    ["Bob Herm", "Example Inc.", "Tampa", "FL"],
    ["James Houston", "Example Inc.", "Dallas", "TX"],
    ["Prabhakar Linwood", "Example Inc.", "Hartford", "CT"],
    ["Kaui Ignace", "Example Inc.", "Yonkers", "NY"],
    ["Esperanza Susanne", "Example Inc.", "Hartford", "CT"],
    ["Christian Birgitte", "Example Inc.", "Tampa", "FL"],
    ["Meral Elias", "Example Inc.", "Hartford", "CT"],
    ["Deep Pau", "Example Inc.", "Yonkers", "NY"],
    ["Sebastiana Hani", "Example Inc.", "Dallas", "TX"],
    ["Marciano Oihana", "Example Inc.", "Yonkers", "NY"],
    ["Brigid Ankur", "Example Inc.", "Dallas", "TX"],
    ["Anna Siranush", "Example Inc.", "Yonkers", "NY"],
    ["Avram Sylva", "Example Inc.", "Hartford", "CT"],
    ["Serafima Babatunde", "Example Inc.", "Tampa", "FL"],
    ["Gaston Festus", "Example Inc.", "Tampa", "FL"],
  ]);

  const [query,setQuery] = useState('');
  const [columns] = useState([
      {
          name: "Name",
          options: {
              filter: true,
              filterList: ['Franky Miles'],
              customFilterListOptions: { render: v => `Name: ${v}` },
              filterOptions: {
                  names: ['a', 'b', 'c', 'Business Analyst']
              },
          }
      },
      {
          name: "Title",
          options: {
              filter: true,
              filterList: ['Business Analyst'],
              customFilterListOptions: { render: v => `Title: ${v}` },
              filterType: 'textField' // set filterType's at the column level
          }
      },
      {
          name: "Location",
          options: {
              filter: false,
          }
      },
      {
          name: "Age",
          options: {
              filter: true,
              customFilterListOptions: { render: v => `Age: ${v}` },
          }
      },
      {
          name: "Salary",
          options: {
              filter: true,
              customFilterListOptions: { render: v => `Salary: ${v}` },
              sort: false
          }
      }
  ]);


  return (
    <>
          <MUIDataTable
            title="Employee List"
            data={datatableData}
            columns={columns}
            options={{
              filterType: "checkbox",
            }}
          />
    </>
  );
}
