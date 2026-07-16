import SelectField from "../common/SelectField";

const SORT_OPTIONS = [
  { value: "newest", label: "Nouveautés" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

export default function SortSelector({ value, onChange }) {
  return <SelectField label="Trier par" value={value} onChange={onChange} options={SORT_OPTIONS} />;
}
