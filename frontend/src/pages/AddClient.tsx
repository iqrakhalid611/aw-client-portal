import { useNavigate, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import type { AccountCategory } from "../types";
import { clientsApi, accountsApi } from "../services/api";
import Card from "../components/Card";
import { IconArrowLeft, IconCheck, IconPlus, IconTrash } from "../components/icons";

const CATEGORIES: { value: AccountCategory; label: string }[] = [
  { value: "retirement", label: "Retirement" },
  { value: "non_retirement", label: "Non-Retirement" },
  { value: "liability", label: "Liability" },
  { value: "trust", label: "Trust" },
];

type AccountRow = {
  account_name: string;
  account_category: AccountCategory;
  last_four: string;
  is_joint: boolean;
};

type FormValues = {
  client_name: string;
  spouse_name: string;
  monthly_salary: string;
  monthly_expenses: string;
  accounts: AccountRow[];
};

const defaultAccount = (): AccountRow => ({
  account_name: "",
  account_category: "retirement",
  last_four: "",
  is_joint: false,
});

function inputCls(hasError: boolean) {
  return `block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-150 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30"
      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 bg-white hover:border-gray-300"
  }`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export default function AddClient() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    defaultValues: {
      client_name: "",
      spouse_name: "",
      monthly_salary: "",
      monthly_expenses: "",
      accounts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "accounts" });

  async function onSubmit(values: FormValues) {
    const client = await clientsApi.create({
      client_name: values.client_name.trim(),
      spouse_name: values.spouse_name.trim() || undefined,
      monthly_salary: parseFloat(values.monthly_salary) || 0,
      monthly_expenses: parseFloat(values.monthly_expenses) || 0,
    });

    if (values.accounts.length > 0) {
      await Promise.all(
        values.accounts.map((acct) =>
          accountsApi.create({
            client_id: client.id,
            account_name: acct.account_name.trim(),
            account_category: acct.account_category,
            last_four: acct.last_four.trim() || undefined,
            is_joint: acct.is_joint,
          })
        )
      );
    }

    setTimeout(() => navigate("/clients"), 1200);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <IconArrowLeft className="w-3.5 h-3.5" />
        Back to Clients
      </Link>

      {isSubmitSuccessful && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0">
            <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">Client added successfully</p>
            <p className="text-xs text-emerald-600">Redirecting to clients list…</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* ── Client Information ─────────────────────────────────────── */}
        <Card title="Client Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label required>Client Name</Label>
              <input
                type="text"
                placeholder="Sarah Mitchell"
                className={inputCls(!!errors.client_name)}
                {...register("client_name", { required: "Client name is required" })}
              />
              <FieldError message={errors.client_name?.message} />
            </div>

            <div>
              <Label>Spouse Name</Label>
              <input
                type="text"
                placeholder="James Mitchell"
                className={inputCls(false)}
                {...register("spouse_name")}
              />
            </div>

            <div>
              <Label required>Monthly Salary</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputCls(!!errors.monthly_salary)} pl-7`}
                  {...register("monthly_salary", {
                    required: "Monthly salary is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />
              </div>
              <FieldError message={errors.monthly_salary?.message} />
            </div>

            <div>
              <Label required>Monthly Expenses</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputCls(!!errors.monthly_expenses)} pl-7`}
                  {...register("monthly_expenses", {
                    required: "Monthly expenses is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />
              </div>
              <FieldError message={errors.monthly_expenses?.message} />
            </div>
          </div>
        </Card>

        {/* ── Accounts ───────────────────────────────────────────────── */}
        <Card
          title="Accounts"
          action={
            <button
              type="button"
              onClick={() => append(defaultAccount())}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <IconPlus className="w-3.5 h-3.5" />
              Add Account
            </button>
          }
        >
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <IconPlus className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">No accounts added</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Add investment, retirement, or liability accounts.</p>
              <button
                type="button"
                onClick={() => append(defaultAccount())}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Add First Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <AccountRowCard
                  key={field.id}
                  index={index}
                  register={register}
                  errors={errors}
                  isJoint={field.is_joint}
                  onRemove={() => remove(index)}
                />
              ))}
              <button
                type="button"
                onClick={() => append(defaultAccount())}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 py-2.5 text-sm font-medium text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Add Another Account
              </button>
            </div>
          )}
        </Card>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isSubmitSuccessful}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving…
              </>
            ) : isSubmitSuccessful ? (
              <>
                <IconCheck className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              "Add Client"
            )}
          </button>
          <Link
            to="/clients"
            className="inline-flex items-center rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

// ── AccountRowCard ─────────────────────────────────────────────────────────────

import type { UseFormRegister, FieldErrors } from "react-hook-form";

function AccountRowCard({
  index,
  register,
  errors,
  isJoint,
  onRemove,
}: {
  index: number;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  isJoint: boolean;
  onRemove: () => void;
}) {
  const acctErrors = errors.accounts?.[index];

  return (
    <div className="rounded-lg border border-gray-200/70 bg-gray-50/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Account {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Remove account"
        >
          <IconTrash className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 sm:col-start-1">
          <Label required>Account Name</Label>
          <input
            type="text"
            placeholder="Fidelity 401(k)"
            className={inputCls(!!acctErrors?.account_name)}
            {...register(`accounts.${index}.account_name`, {
              required: "Account name is required",
            })}
          />
          <FieldError message={acctErrors?.account_name?.message} />
        </div>

        <div>
          <Label required>Category</Label>
          <select
            className={`${inputCls(!!acctErrors?.account_category)} cursor-pointer`}
            {...register(`accounts.${index}.account_category`, {
              required: "Category is required",
            })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <FieldError message={acctErrors?.account_category?.message} />
        </div>

        <div>
          <Label>Last 4 Digits</Label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="1234"
            className={inputCls(!!acctErrors?.last_four)}
            {...register(`accounts.${index}.last_four`, {
              pattern: {
                value: /^\d{4}$/,
                message: "Must be exactly 4 digits",
              },
            })}
          />
          <FieldError message={acctErrors?.last_four?.message} />
        </div>

        <div className="sm:col-span-2">
          <JointToggle index={index} register={register} isJoint={isJoint} />
        </div>
      </div>
    </div>
  );
}

function JointToggle({
  index,
  register,
  isJoint,
}: {
  index: number;
  register: UseFormRegister<FormValues>;
  isJoint: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none group">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          {...register(`accounts.${index}.is_joint`)}
        />
        <div className="w-9 h-5 rounded-full border border-gray-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-gray-300 peer-checked:bg-white peer-checked:translate-x-4 transition-all shadow-sm" />
      </div>
      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
        Joint account
        {isJoint && <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Joint</span>}
      </span>
    </label>
  );
}
