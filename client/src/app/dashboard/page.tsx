"use client";
import Footer from "@/components/Footer";
import { Rp } from "@/helpers/currency";
import {
  ArrowUpCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { calculateRetirementPlan } from "@/helpers/Calculate";
import axios from "axios";
import { SavingType } from "@/type";
import AIRecommendationButton from "@/components/ui/gemini-button";
import Example from "@/components/ui/BarLoader";
import { FloatingNav } from "@/components/ui/floating-navbar";

export default function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSaving, setDataSaving] = useState<SavingType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingAmount, setSavingAmount] = useState("");
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSubmitSaving = async () => {
    try {
      await axios.post(
        "/apis/savings",
        { amountSaved: savingAmount },
        { headers: { "x-UserId": "<USER_ID>" } } // Ganti <USER_ID> dengan ID pengguna Anda
      );

      // Fetch ulang data saving setelah data disimpan
      const newSavings = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/apis/savings`,
        {
          headers: { "x-UserId": "<USER_ID>" },
        }
      );
      setDataSaving(newSavings.data);

      // Tutup modal
      toggleModal();
    } catch (error) {
      console.error("Error submitting saving:", error);
    }
  };

  // Fetching both retirement data and savings data asynchronously
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/apis/retirement`
        );
        setData(response.data);
      } catch (error) {
        console.log("🚀 ~ fetchData ~ error:", error);
      } finally {
        setLoading(false);
      }
    };
    const getSaving = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/apis/savings`
        );
        console.log(response.data, "response.data");
        setDataSaving(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getSaving();
    fetchData();
  }, []);

  if (loading)
    return (
      <div>
        <Example />
      </div>
    );
  if (!data) return <div>No data available</div>;

  const totalSaving = dataSaving.reduce((a, b) => a + b.amountSaved, 0);
   // console.log(totalSaving)

  const {
    currentAge,
    monthlySaving,
    monthlySpending,
    inflationRate,
    investationRate,
  } = data;

  const data2 = {
    currentAge,
    monthlySaving,
    monthlySpending,
    inflationRate,
    investationRate,
    totalSaving
  }

  // Calculate final data using the helper function
  const finalData = calculateRetirementPlan(
    currentAge,
    monthlySaving,
    monthlySpending,
    inflationRate,
    investationRate
  );

 
 

  // Calculate progress as percentage
  const progress = (totalSaving / finalData.targetSaving) * 100;

  return (
    <>
      <FloatingNav />
      <main className="max-w-[1100px] mx-auto">
        <div className="relative isolate overflow-hidden pt-16">
          {/* Header Section */}
          <header className="pb-4 pt-6 sm:pb-6">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
              {/* Total Saving Box */}
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                  <CurrencyDollarIcon className="size-6" />
                  <div className="text-sm/6 font-medium text-gray-900">
                    Total Saving
                  </div>
                </div>
                <div className="px-6 py-4 text-sm/6 flex justify-center">
                  <span className="font-semibold">{Rp(totalSaving)}</span>
                </div>
              </div>

              {/* Radial Progress Bar */}
              <div className="flex justify-center items-center py-6">
                <div
                  className="radial-progress text-navy-dark"
                  style={
                    {
                      "--value": progress,
                      "--size": "12rem",
                      "--thickness": "5px",
                    } as React.CSSProperties
                  }
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="text-2xl font-bold text-gray-800 animate-pulse">
                    {progress.toFixed(2)} %
                  </span>
                </div>
              </div>

              {/* Target Saving Box */}
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                  <CurrencyDollarIcon className="size-6" />
                  <div className="text-sm/6 font-medium text-gray-900">
                    Target Saving
                  </div>
                </div>
                <div className="px-6 py-4 text-sm/6 flex justify-center">
                  <span className="font-semibold">
                    {Rp(finalData.targetSaving)}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Stats Section */}
          <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
            <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8">
                <dt className="text-sm/6 font-medium text-gray-500">
                  Inflation Rate
                </dt>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                  {finalData.inflationRate} <span>%</span>
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8">
                <dt className="text-sm/6 font-medium text-gray-500">
                  Investment Rate
                </dt>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                  {finalData.investmentRate} <span>%</span>
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8">
                <dt className="text-sm/6 font-medium text-gray-500">
                  Monthly Saving
                </dt>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                  {Rp(finalData.monthlySaving)}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8">
                <dt className="text-sm/6 font-medium text-gray-500">
                  Monthly Spending
                </dt>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                  {Rp(finalData.monthlySpending)}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8">
                <dt className="text-sm/6 font-medium text-gray-500">
                  Estimated Retirement Age
                </dt>
                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                  {finalData.retirementAge} years old
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="space-y-16 py-16 xl:space-y-20">
          <div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center h-auto align-middle">
              <h2 className="mx-auto max-w-2xl text-base font-semibold text-gray-900 lg:mx-0 lg:max-w-none">
                Recent activity
              </h2>
              {/* <AIRecommendationButton data={data} /> */}
              <button
                onClick={toggleModal}
                className="bg-navy-dark text-white px-4 py-2 rounded-md transition-all duration-300 ease-in-out transform hover:bg-navy-light hover:scale-105 hover:shadow-lg"
              >
                Add Savings
              </button>

              {/* ganti jadi button add savings */}
            </div>
            <div className="mt-6 overflow-hidden border-t border-gray-100">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                  <table className="w-full text-left">
                    <thead className="text-sm text-gray-900">
                      <tr>
                        <th className="bg-gray-50 border-gray-200 border-b py-2">
                          Amount
                        </th>
                        <th className="bg-gray-50 border-gray-200 border-b py-2">
                          Transaction Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataSaving.map((transaction, index) => (
                        <tr key={transaction._id.toString()}>
                          <td className="relative py-5 pr-6">
                            <div className="flex gap-x-6">
                              <div className="text-gray-900 text-sm">
                                {index + 1}
                              </div>
                              <ArrowUpCircleIcon
                                aria-hidden="true"
                                className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
                              />
                              <div className="flex-auto">
                                <div className="flex items-start gap-x-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    Rp{" "}
                                    {transaction.amountSaved.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 text-sm text-gray-900">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div>
            <AIRecommendationButton data={data2} />
          </div>
        </div>
      </main>
      <Footer />
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Add Savings</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitSaving();
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount Saved
                </label>
                <input
                  id="amount"
                  type="number"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  value={savingAmount}
                  onChange={(e) => setSavingAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="bg-gray-200 px-4 py-2 rounded-md"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
