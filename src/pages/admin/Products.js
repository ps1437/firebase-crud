import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Sidebar } from "primereact/sidebar";
import { Toast } from "primereact/toast";
import { useEffect, useState } from "react";
import AddProduct from "./AddProduct";
import Constant from "../../constants/Constans";
import useToast from '../../hooks/useToast';
import * as ProductService from "../../services/ProductService";
import { removedMsg } from "../../utils/Message";


export default function Product() {
  const [products, setproducts] = useState([]);
  const toast = useToast();
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedproducts, setSelectedproducts] = useState([]);
  const [visibleSideBar, setVisibleSideBar] = useState(false);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let products = await ProductService.fetchProducts();
    console.log(products);
    setproducts(products);
    setLoading(false);
  };

  const deleteRecords = () => {
    const codes = selectedproducts.map((category) => category.code);
    ProductService.deleteProducts(codes).then(() => {
      showSuccess(removedMsg("products"));
      setSelectedproducts([]);
      loadData();
    });
  };

  const deleteConfirm = () => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept,
    });
  };

  const accept = () => {
    deleteRecords();
  };

  const onRowEditComplete = (e) => {
    let _products = [...products];
    let { newData, index } = e;
    _products[index] = newData;
    ProductService.updateProduct(newData);
    setproducts(_products);
  };

  const showToast = (msg, severity) => {
    toast.current.show({
      severity: severity,
      detail: msg,
      life: 3000,
    });
  };

  const showError = (msg) => {
    showToast(msg, "error");
  };

  const showSuccess = (msg) => {
    showToast(msg, "success");
  };

  const clearFilter = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
    });
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };
  const updateCategory = (item) => {
    let _products = [...products];
    _products.unshift({
      ...item,
    });
    setVisibleSideBar(false);
    setproducts(_products);
  };
  const renderHeader = () => {
    return (
      <>
        <div className="flex-container ">
          <div className="table-header">products</div>

          <div
            className="p-input-icon-left  "
            style={{ justifyContent: "center" }}
          >
            <i className="pi pi-search " />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Keyword Search"
            />
          </div>
          <div
            className="flex-container "
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              icon="pi pi-plus "
              onClick={() => setVisibleSideBar(true)}
              className="ml-1"
              tooltip="Add Item"
              tooltipOptions={{ position: "bottom" }}
            />

            <Button
              type="button"
              icon="pi pi-filter-slash "
              className="p-button-outlined ml-1"
              onClick={clearFilter}
              tooltip="Clear Filters"
              tooltipOptions={{ position: "bottom" }}
            />

            {selectedproducts.length > 0 && (
              <Button
                type="button"
                icon="pi pi-trash"
                className="p-button-danger ml-1  "
                tooltip="Delete"
                onClick={deleteConfirm}
                tooltipOptions={{ position: "bottom" }}
              ></Button>
            )}
          </div>
        </div>
      </>
    );
  };
  const header = renderHeader();

  const textEditor = (options) => (
    <InputText
      type="text"
      value={options.value}
      onChange={(e) => options.editorCallback(e.target.value)}
    />
  );

  return (
    <div className="container">
      <Toast ref={toast} />
      <Card className="mx-auto">
        <Sidebar
          visible={visibleSideBar}
          style={{ width: "25rem" }}
          modal={true}
          position="right"
          onHide={() => setVisibleSideBar(false)}
        >
          <AddProduct
            showSuccess={showSuccess}
            showError={showError}
            updateCategory={updateCategory}
          />
        </Sidebar>

        <DataTable
          value={products}
          paginator
          className="p-datatable-customers"
          header={header}
          rows={Constant.ROW_PER_PAGE}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          rowsPerPageOptions={Constant.ROW_PER_PAGE_OPTIONS}
          dataKey="id"
          rowHover
          selection={selectedproducts}
          onSelectionChange={(e) => setSelectedproducts(e.value)}
          filters={filters}
          filterDisplay="menu"
          loading={loading}
          responsiveLayout="scroll"
          editMode="row"
          stripedRows
          onRowEditComplete={onRowEditComplete}
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3em" }}
          ></Column>
          <Column
            field="name"
            header="Name"
            sortable
            filter
            editor={(options) => textEditor(options)}
            filterPlaceholder="Search by name"
            style={{ minWidth: "5rem" }}
          ></Column>
           <Column
            field="price"
            header="Price"
            sortable
            editor={(options) => textEditor(options)}
            style={{ minWidth: "5rem" }}
          ></Column>
            <Column
            field="sellPrice"
            header="Sell Price"
            editor={(options) => textEditor(options)}
            style={{ minWidth: "5rem" }}
          ></Column>
             <Column
            field="category"
            header="Category"
            sortable
            editor={(options) => textEditor(options)}
            style={{ minWidth: "5rem" }}
          >
            
          </Column>
          <Column
            field="isAvailable"
            header="Available"
            sortable
            
            editor={(options) => textEditor(options)}
            style={{ minWidth: "5rem" }}
          >
            
          </Column>

            <Column
            field="discount"
            header="Discount"
            
            editor={(options) => textEditor(options)}
            style={{ minWidth: "5rem" }}
          ></Column>
          <Column
            rowEditor
            headerStyle={{ width: "10%", minWidth: "8rem" }}
            bodyStyle={{ textAlign: "center" }}
            tooltip="Edit Item"
            tooltipOptions={{ position: "bottom" }}
          ></Column>
        </DataTable>
      </Card>
    </div>
  );
}
