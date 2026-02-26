import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className || ''}`} {...props}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ className, children, ...props }) => {
  return (
    <thead className={`[&_tr]:border-b ${className || ''}`} {...props}>
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableBody: React.FC<TableBodyProps> = ({ className, children, ...props }) => {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${className || ''}`} {...props}>
      {children}
    </tbody>
  );
};

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableFooter: React.FC<TableFooterProps> = ({ className, children, ...props }) => {
  return (
    <tfoot className={`border-t bg-gray-100 font-medium [&_tr]:last:border-b-0 ${className || ''}`} {...props}>
      {children}
    </tfoot>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

const TableRow: React.FC<TableRowProps> = ({ className, children, ...props }) => {
  return (
    <tr
      className={`border-b transition-colors hover:bg-gray-100 data-[state=selected]:bg-gray-100 ${
        className || ''
      }`}
      {...props}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TableHead: React.FC<TableHeadProps> = ({ className, children, ...props }) => {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${
        className || ''
      }`}
      {...props}
    >
      {children}
    </th>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TableCell: React.FC<TableCellProps> = ({ className, children, ...props }) => {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
      {...props}
    >
      {children}
    </td>
  );
};

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode;
}

const TableCaption: React.FC<TableCaptionProps> = ({ className, children, ...props }) => {
  return (
    <caption className={`mt-4 text-sm text-gray-500 ${className || ''}`} {...props}>
      {children}
    </caption>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
