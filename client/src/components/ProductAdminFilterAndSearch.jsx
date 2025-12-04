import React, { useState } from 'react'

const ProductAdminFilterAndSearch = ({collections, onFilter}) => {

  const handleChange = (event) => {
    const value = event.target.value.toLowerCase()

    const filtered = collections.filter(val => {
      return val.name.toLowerCase().includes(value)
    })
    onFilter(filtered)

  }

    return(
      <div className="w-full p-4 bg-white rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        type="search"
        placeholder="Search product name…"
        className="border rounded p-2"
        onChange={handleChange}
      />
      </div>
    )
};

export default ProductAdminFilterAndSearch