import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

interface Club {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Venue {
  _id: string;
  name: string;
  capacity: number;
}

interface Resource {
  _id: string;
  name: string;
  category: string;
  availableQuantity?: number;
  quantity?: number;
}

interface SelectedResource {
  resourceId: string;
  quantity: number;
}

interface ConflictResult {
  hasConflict: boolean;
  academicConflict: boolean;
  venueConflict: boolean;
  conflicts: {
    type: "academic" | "venue";
    message: string;
    eventId?: string;
    title?: string;
  }[];
}

const steps = [
  "Event Specification",
  "Schedule & Facility",
  "Inventory",
  "Budget & Dignitaries",
  "Review & Submit",
];

const CreateEvent = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [conflict, setConflict] =
    useState<ConflictResult | null>(null);

  const [form, setForm] = useState({
    title: "",
    clubId: "",
    departmentId: "",
    category: "Technical",
    description: "",
    expectedParticipants: "",
    capacity: "",

    startDate: "",
    startTime: "",
    endTime: "",
    venueId: "",

    budget: "",
    dignitaries: "",
    objectives: "",
    termsAccepted: false,
  });

  const [selectedResources, setSelectedResources] =
    useState<SelectedResource[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [clubsRes, venuesRes, resourcesRes, departmentsRes] =
        await Promise.allSettled([
          api.get("/clubs"),
          api.get("/venues"),
          api.get("/resources"),
          api.get("/departments"),
        ]);

      if (clubsRes.status === "fulfilled") {
        setClubs(clubsRes.value.data?.data || clubsRes.value.data || []);
      } else {
        console.error("Failed to load clubs:", clubsRes.reason);
      }

      if (departmentsRes.status === "fulfilled") {
        setDepartments(departmentsRes.value.data?.data || departmentsRes.value.data || []);
      } else {
        console.error("Failed to load departments:", departmentsRes.reason);
      }

      if (venuesRes.status === "fulfilled") {
        setVenues(venuesRes.value.data?.data || venuesRes.value.data || []);
      } else {
        console.error("Failed to load venues:", venuesRes.reason);
      }

      if (resourcesRes.status === "fulfilled") {
        setResources(resourcesRes.value.data?.data || resourcesRes.value.data || []);
      } else {
        console.error("Failed to load resources:", resourcesRes.reason);
      }

      if (
        clubsRes.status === "rejected" ||
        venuesRes.status === "rejected" ||
        resourcesRes.status === "rejected" ||
        departmentsRes.status === "rejected"
      ) {
        toast.error("Failed to load some proposal data");
      }
    } catch (error) {
      console.error("Failed to load proposal data:", error);
      toast.error("Failed to load proposal data");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (
      field === "startDate" ||
      field === "startTime" ||
      field === "endTime" ||
      field === "venueId"
    ) {
      setConflict(null);
    }
  };

  const getStartDateTime = () =>
    `${form.startDate}T${form.startTime}`;

  const getEndDateTime = () =>
    `${form.startDate}T${form.endTime}`;

  const checkConflicts = async (venueOverride?: string): Promise<ConflictResult | null> => {
    if (
      !form.startDate ||
      !form.startTime ||
      !form.endTime
    ) {
      return null;
    }

    const startDate = getStartDateTime();
    const endDate = getEndDateTime();

    if (new Date(startDate) >= new Date(endDate)) {
      const result: ConflictResult = {
        hasConflict: true,
        academicConflict: false,
        venueConflict: false,
        conflicts: [
          {
            type: "academic",
            message: "End time must be after start time.",
          },
        ],
      };

      setConflict(result);
      return result;
    }

    const venueToUse = venueOverride !== undefined ? venueOverride : form.venueId;

    try {
      setCheckingConflict(true);

      const response = await api.post("/conflicts/check", {
        venueId: venueToUse || undefined,
        startDate,
        endDate,
      });

      const result = response.data.data;

      setConflict(result);

      return result;
    } catch (error: any) {
      console.error("Conflict check failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to check schedule"
      );

      return null;
    } finally {
      setCheckingConflict(false);
    }
  };

  useEffect(() => {
    if (
      form.startDate &&
      form.startTime &&
      form.endTime
    ) {
      const timer = setTimeout(() => {
        checkConflicts();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [
    form.startDate,
    form.startTime,
    form.endTime,
    form.venueId,
  ]);

  const validateStep1 = () => {
    if (!form.title.trim()) {
      toast.error("Enter an event title");
      return false;
    }

    if (!form.clubId) {
      toast.error("Select the organizing club");
      return false;
    }

    if (!form.departmentId) {
      toast.error("Select the organizing department");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("Enter an event description");
      return false;
    }

    if (!form.expectedParticipants) {
      toast.error("Enter expected participants");
      return false;
    }

    if (!form.capacity) {
      toast.error("Enter maximum participant capacity");
      return false;
    }

    if (
      Number(form.expectedParticipants) >
      Number(form.capacity)
    ) {
      toast.error(
        "Expected participants cannot exceed maximum capacity"
      );
      return false;
    }

    return true;
  };

  const validateStep2 = async () => {
    if (!form.startDate) {
      toast.error("Select an event date");
      return false;
    }

    if (!form.startTime || !form.endTime) {
      toast.error("Select start and end time");
      return false;
    }

    if (!form.venueId) {
      toast.error("Select a venue");
      return false;
    }

    const result = await checkConflicts();

    if (!result) {
      toast.error("Unable to verify event schedule");
      return false;
    }

    if (result.hasConflict) {
      toast.error(
        "Resolve the scheduling conflict before continuing"
      );
      return false;
    }

    return true;
  };

  const validateStep4 = () => {
    if (!form.termsAccepted) {
      toast.error(
        "Accept the safety and code of conduct agreement"
      );
      return false;
    }

    return true;
  };

  const nextStep = async () => {
    if (step === 1 && !validateStep1()) {
      return;
    }

    if (step === 2 && !(await validateStep2())) {
      return;
    }

    if (step === 4 && !validateStep4()) {
      return;
    }

    setStep((previous) => Math.min(previous + 1, 5));
  };

  const previousStep = () => {
    setStep((previous) => Math.max(previous - 1, 1));
  };

  const getResourceQuantity = (resourceId: string) => {
    return (
      selectedResources.find(
        (item) => item.resourceId === resourceId
      )?.quantity || 0
    );
  };

  const getAvailableQuantity = (resource: Resource) => {
    return (
      resource.availableQuantity ??
      resource.quantity ??
      0
    );
  };

  const updateResourceQuantity = (
    resourceId: string,
    quantity: number
  ) => {
    const resource = resources.find(
      (item) => item._id === resourceId
    );

    if (!resource) return;

    const available = getAvailableQuantity(resource);

    const safeQuantity = Math.max(
      0,
      Math.min(quantity, available)
    );

    setSelectedResources((previous) => {
      const existing = previous.find(
        (item) => item.resourceId === resourceId
      );

      if (safeQuantity === 0) {
        return previous.filter(
          (item) => item.resourceId !== resourceId
        );
      }

      if (existing) {
        return previous.map((item) =>
          item.resourceId === resourceId
            ? {
                ...item,
                quantity: safeQuantity,
              }
            : item
        );
      }

      return [
        ...previous,
        {
          resourceId,
          quantity: safeQuantity,
        },
      ];
    });
  };

  const submitProposal = async (status: "draft" | "submitted") => {
    if (status === "submitted") {
      if (!validateStep1()) {
        setStep(1);
        return;
      }

      if (!(await validateStep2())) {
        setStep(2);
        return;
      }

      if (!validateStep4()) {
        setStep(4);
        return;
      }
    } else if (status === "draft") {
      if (form.startDate && form.startTime && form.endTime) {
        const draftConflictCheck = await checkConflicts();
        if (draftConflictCheck?.hasConflict) {
          setStep(2);
          toast.error("Event cannot be saved as draft because a scheduling conflict exists.");
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const response = await api.post("/events", {
        title: form.title,
        description: form.description,
        clubId: form.clubId,
        departmentId: form.departmentId,
        category: form.category,

        startDate: getStartDateTime(),
        endDate: getEndDateTime(),

        venueId: form.venueId,

        capacity: Number(form.capacity),

        budget: form.budget
          ? Number(form.budget)
          : undefined,

        dignitaries: form.dignitaries
          ? form.dignitaries
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        objectives: form.objectives
          ? form.objectives
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        resources: selectedResources,

        status,
        registrationOpen: false,
      });

      if (response.data.success) {
        toast.success(
          status === "draft"
            ? "Proposal saved as draft"
            : "Proposal submitted for approval"
        );

        navigate("/proposals");
      }
    } catch (error: any) {
      console.error("Proposal submission error:", error);

      if (error.response?.status === 409) {
        const errorData = error.response.data;
        const conflictData = errorData?.data;
        setConflict(conflictData || null);
        setStep(2);

        const conflictMessages = conflictData?.conflicts
          ?.map((c: any) => c.message)
          .join(" \n• ");

        const fullMessage = conflictMessages
          ? `${errorData.message || "Event cannot be proposed because a scheduling conflict exists."}\n• ${conflictMessages}`
          : (errorData.message || "Event cannot be proposed because a scheduling conflict exists.");

        toast.error(fullMessage, { duration: 6000 });
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to save proposal"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading proposal workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-10">

      {/* Header */}

      <div className="mb-8">
        <button
          onClick={() => navigate("/events")}
          className="mb-4 text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to Events
        </button>

        <h1 className="text-3xl font-semibold text-slate-900">
          Event Proposal
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Complete the proposal in five simple steps.
        </p>
      </div>

      {/* Step Indicator */}

      <div className="mb-8 border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">

          {steps.map((label, index) => {
            const stepNumber = index + 1;

            const active = step === stepNumber;
            const completed = step > stepNumber;

            return (
              <div
                key={label}
                className="flex flex-1 items-center"
              >
                <div className="flex flex-col items-center">

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      active
                        ? "bg-slate-900 text-white"
                        : completed
                        ? "bg-green-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {completed ? "✓" : stepNumber}
                  </div>

                  <span
                    className={`mt-2 hidden text-center text-xs md:block ${
                      active
                        ? "font-semibold text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {stepNumber < steps.length && (
                  <div
                    className={`mx-2 h-px flex-1 ${
                      completed
                        ? "bg-green-500"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* STEP 1 */}

      {step === 1 && (
        <section className="border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-semibold">
            Event Specification
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tell us the basic details of your proposed event.
          </p>

          <div className="mt-6 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Event Title
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                placeholder="Example: AI Innovation Hackathon"
                className="w-full border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Organizing Club
                </label>

                <select
                  value={form.clubId}
                  onChange={(e) =>
                    updateField(
                      "clubId",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 px-4 py-3"
                >
                  <option value="">
                    Select club
                  </option>

                  {clubs.map((club) => (
                    <option
                      key={club._id}
                      value={club._id}
                    >
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Organizing Department
                </label>

                <select
                  value={form.departmentId}
                  onChange={(e) =>
                    updateField(
                      "departmentId",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 px-4 py-3"
                >
                  <option value="">
                    Select department
                  </option>

                  {departments.map((dept) => (
                    <option
                      key={dept._id}
                      value={dept._id}
                    >
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Classification
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 px-4 py-3"
                >
                  <option>Technical</option>
                  <option>Cultural</option>
                  <option>Sports</option>
                  <option>Workshop</option>
                  <option>Seminar</option>
                  <option>Competition</option>
                  <option>Other</option>
                </select>
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Scope Description
              </label>

              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe what the event is about..."
                className="w-full resize-none border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Expected Attendees
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.expectedParticipants}
                  onChange={(e) =>
                    updateField(
                      "expectedParticipants",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Maximum Participant Cap
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) =>
                    updateField(
                      "capacity",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 px-4 py-3"
                />
              </div>

            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={nextStep}
              className="bg-slate-900 px-6 py-3 text-sm font-medium text-white"
            >
              Next: Schedule & Venue →
            </button>
          </div>

        </section>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <section className="border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-semibold">
            Schedule & Facility Reservation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a date, time and available venue.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Date
              </label>

              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  updateField(
                    "startDate",
                    e.target.value
                  )
                }
                className="w-full border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Start Time
              </label>

              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  updateField(
                    "startTime",
                    e.target.value
                  )
                }
                className="w-full border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                End Time
              </label>

              <input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  updateField(
                    "endTime",
                    e.target.value
                  )
                }
                className="w-full border border-slate-300 px-4 py-3"
              />
            </div>

          </div>

          <div className="mt-7">

            <h3 className="mb-3 text-sm font-semibold">
              Select Venue
            </h3>

            <div className="grid gap-4 md:grid-cols-2">

              {venues.map((venue) => {
                const selected =
                  form.venueId === venue._id;

                return (
                  <button
                    type="button"
                    key={venue._id}
                    onClick={() => {
                      updateField(
                        "venueId",
                        venue._id
                      );
                      checkConflicts(venue._id);
                    }}
                    className={`text-left border p-5 transition ${
                      selected
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <p className="font-semibold">
                          {venue.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Capacity: {venue.capacity}
                        </p>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs ${
                          Number(form.capacity) >
                          venue.capacity
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {Number(form.capacity) >
                        venue.capacity
                          ? "Too Small"
                          : "Capacity OK"}
                      </div>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>

          {checkingConflict && (
            <div className="mt-6 bg-slate-50 p-4 text-sm text-slate-600">
              Checking schedule availability...
            </div>
          )}

          {conflict?.hasConflict && (
            <div className="mt-6 border border-red-200 bg-red-50 p-5">

              <p className="font-semibold text-red-800">
                Scheduling Conflict
              </p>

              <div className="mt-2 space-y-1">
                {conflict.conflicts.map(
                  (item, index) => (
                    <p
                      key={index}
                      className="text-sm text-red-700"
                    >
                      • {item.message}
                    </p>
                  )
                )}
              </div>

              {conflict.academicConflict && (
                <p className="mt-3 text-sm font-medium text-red-800">
                  {conflict.conflicts.find((c) => c.type === "academic")?.title
                    ? `Event cannot be scheduled during ${conflict.conflicts.find((c) => c.type === "academic")?.title}.`
                    : "Event cannot be scheduled during restricted academic period."}
                </p>
              )}

              {conflict.venueConflict && (
                <p className="mt-3 text-sm font-medium text-red-800">
                  Selected venue is already booked during this time.
                </p>
              )}

            </div>
          )}

          {conflict &&
            !conflict.hasConflict &&
            !checkingConflict && (
              <div className="mt-6 border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
                ✓ Venue and schedule are available.
              </div>
            )}

          <div className="mt-8 flex justify-between">

            <button
              onClick={previousStep}
              className="border border-slate-300 px-5 py-3 text-sm"
            >
              ← Back
            </button>

            <button
              onClick={nextStep}
              disabled={checkingConflict || !!conflict?.hasConflict}
              className="bg-slate-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Resources →
            </button>

          </div>

        </section>
      )}

      {/* STEP 3 */}

      {step === 3 && (
        <section className="border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-semibold">
            Central Inventory Requisition
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the equipment required for your event.
          </p>

          <div className="mt-6 space-y-3">

            {resources.map((resource) => {
              const quantity =
                getResourceQuantity(resource._id);

              const available =
                getAvailableQuantity(resource);

              return (
                <div
                  key={resource._id}
                  className="flex items-center justify-between border border-slate-200 p-4"
                >

                  <div>
                    <p className="font-medium">
                      {resource.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {resource.category} · Available:{" "}
                      {available}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        updateResourceQuantity(
                          resource._id,
                          quantity - 1
                        )
                      }
                      className="h-9 w-9 border border-slate-300"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      max={available}
                      value={quantity}
                      onChange={(e) =>
                        updateResourceQuantity(
                          resource._id,
                          Number(e.target.value)
                        )
                      }
                      className="h-9 w-16 border border-slate-300 text-center"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        updateResourceQuantity(
                          resource._id,
                          quantity + 1
                        )
                      }
                      className="h-9 w-9 border border-slate-300"
                    >
                      +
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

          <div className="mt-8 flex justify-between">

            <button
              onClick={previousStep}
              className="border border-slate-300 px-5 py-3 text-sm"
            >
              ← Back
            </button>

            <button
              onClick={nextStep}
              className="bg-slate-900 px-6 py-3 text-sm font-medium text-white"
            >
              Next: Budget & Dignitaries →
            </button>

          </div>

        </section>
      )}

      {/* STEP 4 */}

      {step === 4 && (
        <section className="border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-semibold">
            Budget & Dignitaries
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add the financial and academic information
            associated with the event.
          </p>

          <div className="mt-6 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Estimated Budget (₹)
              </label>

              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) =>
                  updateField(
                    "budget",
                    e.target.value
                  )
                }
                placeholder="Example: 25000"
                className="w-full border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Chief Guests & Dignitaries
              </label>

              <input
                value={form.dignitaries}
                onChange={(e) =>
                  updateField(
                    "dignitaries",
                    e.target.value
                  )
                }
                placeholder="Separate multiple names with commas"
                className="w-full border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Objectives & Learning Outcomes
              </label>

              <textarea
                rows={6}
                value={form.objectives}
                onChange={(e) =>
                  updateField(
                    "objectives",
                    e.target.value
                  )
                }
                placeholder="Enter one objective per line"
                className="w-full resize-none border border-slate-300 px-4 py-3"
              />
            </div>

            <label className="flex cursor-pointer gap-3 border border-slate-200 p-4">

              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) =>
                  updateField(
                    "termsAccepted",
                    e.target.checked
                  )
                }
                className="mt-1"
              />

              <span className="text-sm text-slate-600">
                I confirm that the event follows the
                institution's safety requirements and
                code of conduct.
              </span>

            </label>

          </div>

          <div className="mt-8 flex justify-between">

            <button
              onClick={previousStep}
              className="border border-slate-300 px-5 py-3 text-sm"
            >
              ← Back
            </button>

            <button
              onClick={nextStep}
              className="bg-slate-900 px-6 py-3 text-sm font-medium text-white"
            >
              Next: Review & Submit →
            </button>

          </div>

        </section>
      )}

      {/* STEP 5 */}

      {step === 5 && (
        <section className="border border-slate-200 bg-white p-6">

          <h2 className="text-xl font-semibold">
            Review & Submission
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review your proposal before sending it
            through the approval workflow.
          </p>

          <div className="mt-6 space-y-5">

            <ReviewRow
              label="Event"
              value={form.title}
            />

            <ReviewRow
              label="Category"
              value={form.category}
            />

            <ReviewRow
              label="Description"
              value={form.description}
            />

            <ReviewRow
              label="Expected Participants"
              value={form.expectedParticipants}
            />

            <ReviewRow
              label="Maximum Capacity"
              value={form.capacity}
            />

            <ReviewRow
              label="Date"
              value={form.startDate}
            />

            <ReviewRow
              label="Time"
              value={`${form.startTime} – ${form.endTime}`}
            />

            <ReviewRow
              label="Venue"
              value={
                venues.find(
                  (venue) =>
                    venue._id === form.venueId
                )?.name || "Not selected"
              }
            />

            <ReviewRow
              label="Budget"
              value={
                form.budget
                  ? `₹${form.budget}`
                  : "Not specified"
              }
            />

            <ReviewRow
              label="Dignitaries"
              value={
                form.dignitaries ||
                "None specified"
              }
            />

            <div className="border-t border-slate-200 pt-5">

              <p className="text-sm font-semibold">
                Objectives
              </p>

              <div className="mt-2 whitespace-pre-line text-sm text-slate-600">
                {form.objectives ||
                  "No objectives specified"}
              </div>

            </div>

            <div className="border-t border-slate-200 pt-5">

              <p className="text-sm font-semibold">
                Requested Resources
              </p>

              <div className="mt-3 space-y-2">

                {selectedResources.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No resources requested.
                  </p>
                ) : (
                  selectedResources.map((item) => {
                    const resource = resources.find(
                      (resource) =>
                        resource._id === item.resourceId
                    );

                    return (
                      <div
                        key={item.resourceId}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {resource?.name}
                        </span>

                        <span className="font-medium">
                          {item.quantity}
                        </span>
                      </div>
                    );
                  })
                )}

              </div>

            </div>

          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

            <button
              onClick={previousStep}
              className="border border-slate-300 px-5 py-3 text-sm"
            >
              ← Back
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                onClick={() =>
                  submitProposal("draft")
                }
                disabled={submitting}
                className="border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : "Save as Draft"}
              </button>

              <button
                onClick={() =>
                  submitProposal("submitted")
                }
                disabled={submitting}
                className="bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Proposal for Approval"}
              </button>

            </div>

          </div>

        </section>
      )}

    </div>
  );
};

interface ReviewRowProps {
  label: string;
  value: string;
}

const ReviewRow = ({
  label,
  value,
}: ReviewRowProps) => {
  return (
    <div className="grid gap-2 border-b border-slate-100 pb-4 md:grid-cols-[180px_1fr]">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="whitespace-pre-line text-sm text-slate-900">
        {value}
      </p>
    </div>
  );
};

export default CreateEvent;