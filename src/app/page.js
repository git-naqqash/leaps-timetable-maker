"use client";

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function Home() {
  // --- STATE DECLARATIONS ---
  const [activeTab, setActiveTab] = useState("academy");
  const [error, setError] = useState("");

  // Step 1: Academy
  const [academyName, setAcademyName] = useState("LEAPS Academy");
  const [headingText, setHeadingText] = useState("Time Table");
  const [logo, setLogo] = useState(""); // Base64
  const [footerText, setFooterText] = useState("LA25092025 V 1.1");

  // Step 2: Classes
  const [classes, setClasses] = useState([
    { id: "class-1", name: "9th", startTime: "16:00", endTime: "20:30" },
    { id: "class-2", name: "10th", startTime: "16:00", endTime: "20:30" },
    { id: "class-3", name: "First Year", startTime: "16:00", endTime: "20:30" },
    { id: "class-4", name: "Second Year", startTime: "16:00", endTime: "20:30" }
  ]);

  // Step 3: Teachers
  const [teachers, setTeachers] = useState([
    {
      id: "teacher-1",
      name: "Sir Ali",
      subject: "Math",
      secondSubject: "Physics",
      availableFrom: "16:30",
      availableTill: "20:00",
      allowedClasses: ["9th", "10th", "First Year", "Second Year"]
    },
    {
      id: "teacher-2",
      name: "Sir Imran",
      subject: "Islamiyat",
      secondSubject: "T. Quran",
      availableFrom: "16:00",
      availableTill: "20:30",
      allowedClasses: ["9th", "10th"]
    }
  ]);

  // Step 4 & 5: Timetable Data
  // Structured exactly as: { timeSlots: [ { label: "...", start: 960, end: 990 } ], rows: [ { classId: "...", className: "...", cells: [ { subject: "...", teacher: "...", type: "..." } ] } ] }
  const [timetable, setTimetable] = useState({ timeSlots: [], rows: [] });

  const previewRef = useRef(null);

  // --- LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    try {
      const savedAcademyName = localStorage.getItem("leaps_academy_name");
      const savedHeadingText = localStorage.getItem("leaps_heading_text");
      const savedLogo = localStorage.getItem("leaps_logo");
      const savedFooterText = localStorage.getItem("leaps_footer_text");
      const savedClasses = localStorage.getItem("leaps_classes");
      const savedTeachers = localStorage.getItem("leaps_teachers");

      if (savedAcademyName) setAcademyName(savedAcademyName);
      if (savedHeadingText) setHeadingText(savedHeadingText);
      if (savedLogo) setLogo(savedLogo);
      if (savedFooterText) setFooterText(savedFooterText);
      if (savedClasses) setClasses(JSON.parse(savedClasses));
      if (savedTeachers) setTeachers(JSON.parse(savedTeachers));
      
      const saved = localStorage.getItem("leaps_timetable");
      if (saved) setTimetable(JSON.parse(saved));
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }, []);

  const saveData = (updatedData = {}) => {
    try {
      const dAcademyName = updatedData.academyName ?? academyName;
      const dHeading = updatedData.headingText ?? headingText;
      const dLogo = updatedData.logo ?? logo;
      const dFooter = updatedData.footerText ?? footerText;
      const dClasses = updatedData.classes ?? classes;
      const dTeachers = updatedData.teachers ?? teachers;
      const dTimetable = updatedData.timetable ?? timetable;

      localStorage.setItem("leaps_academy_name", dAcademyName);
      localStorage.setItem("leaps_heading_text", dHeading);
      localStorage.setItem("leaps_logo", dLogo);
      localStorage.setItem("leaps_footer_text", dFooter);
      localStorage.setItem("leaps_classes", JSON.stringify(dClasses));
      localStorage.setItem("leaps_teachers", JSON.stringify(dTeachers));
      localStorage.setItem("leaps_timetable", JSON.stringify(dTimetable));
    } catch (e) {
      console.error("Error writing localStorage:", e);
    }
  };

  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all data to default settings?")) {
      localStorage.clear();
      setAcademyName("LEAPS Academy");
      setHeadingText("Time Table");
      setLogo("");
      setFooterText("LA25092025 V 1.1");
      setError("");
      
      const defaultClasses = [
        { id: "class-1", name: "9th", startTime: "16:00", endTime: "20:30" },
        { id: "class-2", name: "10th", startTime: "16:00", endTime: "20:30" },
        { id: "class-3", name: "First Year", startTime: "16:00", endTime: "20:30" },
        { id: "class-4", name: "Second Year", startTime: "16:00", endTime: "20:30" }
      ];
      setClasses(defaultClasses);

      const defaultTeachers = [
        {
          id: "teacher-1",
          name: "Sir Ali",
          subject: "Math",
          secondSubject: "Physics",
          availableFrom: "16:30",
          availableTill: "20:00",
          allowedClasses: ["9th", "10th", "First Year", "Second Year"]
        },
        {
          id: "teacher-2",
          name: "Sir Imran",
          subject: "Islamiyat",
          secondSubject: "T. Quran",
          availableFrom: "16:00",
          availableTill: "20:30",
          allowedClasses: ["9th", "10th"]
        }
      ];
      setTeachers(defaultTeachers);
      setTimetable({ timeSlots: [], rows: [] });
      setActiveTab("academy");
      alert("All data reset successfully.");
    }
  };

  // --- SAFE TIME HELPER FUNCTIONS ---
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    try {
      timeStr = timeStr.trim().toUpperCase();
      const amp = timeStr.match(/(AM|PM)/);
      if (amp) {
        const period = amp[1];
        const timePart = timeStr.replace(/(AM|PM)/, "").trim();
        const parts = timePart.split(":");
        let h = parseInt(parts[0], 10);
        const m = parts[1] ? parseInt(parts[1], 10) : 0;
        if (isNaN(h) || isNaN(m)) return null;
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return h * 60 + m;
      }
      const parts = timeStr.split(":");
      const h = parseInt(parts[0], 10);
      const m = parts[1] ? parseInt(parts[1], 10) : 0;
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    } catch (e) {
      return null;
    }
  };

  const formatMinutesToTime = (minutes) => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return "";
    try {
      const hours = Math.floor(minutes / 60);
      const m = minutes % 60;
      const period = hours >= 12 ? "PM" : "AM";
      let displayH = hours % 12;
      if (displayH === 0) displayH = 12;
      const displayM = m.toString().padStart(2, "0");
      return `${displayH}:${displayM} ${period}`;
    } catch (e) {
      return "";
    }
  };

  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    try {
      const startM = parseTimeToMinutes(startTime);
      const endM = parseTimeToMinutes(endTime);
      if (startM === null || endM === null || startM >= endM) return slots;
      for (let m = startM; m < endM; m += 30) {
        const label = `${formatMinutesToTime(m)}–${formatMinutesToTime(m + 30)}`;
        slots.push({ label, start: m, end: m + 30 });
      }
    } catch (e) {
      console.error("generateTimeSlots error:", e);
    }
    return slots;
  };

  // --- LOGO UPLOADER ---
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        saveData({ logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- GENERATION ENGINE WITH SAFE VALIDATIONS ---
  const generateTimetable = () => {
    setError("");
    try {
      const safeClasses = classes || [];
      const safeTeachers = teachers || [];

      let hasClassError = false;
      safeClasses.forEach((c) => {
        if (!c.name || !c.name.trim() || !c.startTime || !c.endTime) {
          hasClassError = true;
        }
      });

      let hasTeacherError = false;
      safeTeachers.forEach((t) => {
        if (
          !t.name ||
          !t.name.trim() ||
          !t.subject ||
          !t.subject.trim() ||
          !t.availableFrom ||
          !t.availableTill ||
          !t.allowedClasses ||
          t.allowedClasses.length === 0
        ) {
          hasTeacherError = true;
        }
      });

      if (hasClassError || hasTeacherError || safeClasses.length === 0) {
        setError("Please complete all required fields before generating timetable.");
        return;
      }

      for (let i = 0; i < safeClasses.length; i++) {
        const c = safeClasses[i];
        const start = parseTimeToMinutes(c.startTime);
        const end = parseTimeToMinutes(c.endTime);
        if (start === null || end === null || start >= end) {
          setError(`Invalid start/end times for class: ${c.name}`);
          return;
        }
      }

      for (let i = 0; i < safeTeachers.length; i++) {
        const t = safeTeachers[i];
        const start = parseTimeToMinutes(t.availableFrom);
        const end = parseTimeToMinutes(t.availableTill);
        if (start === null || end === null || start >= end) {
          setError(`Invalid availability times for teacher: ${t.name}`);
          return;
        }
      }

      const classSlotsMap = {};
      const allUniqueSlotsMap = new Map();

      safeClasses.forEach((c) => {
        const slots = generateTimeSlots(c.startTime, c.endTime);
        classSlotsMap[c.id] = slots;
        slots.forEach((s) => {
          allUniqueSlotsMap.set(s.label, s);
        });
      });

      const sortedSlots = Array.from(allUniqueSlotsMap.values()).sort((a, b) => a.start - b.start);

      const rows = safeClasses.map((c) => ({
        classId: c.id,
        className: c.name,
        cells: new Array(sortedSlots.length).fill(null)
      }));

      const busyTeachersPerSlot = {};
      sortedSlots.forEach((slot) => {
        busyTeachersPerSlot[slot.label] = new Set();
      });

      const isTeacherAvailableForSlot = (teacher, slot) => {
        const teacherStartMin = parseTimeToMinutes(teacher.availableFrom);
        const teacherEndMin = parseTimeToMinutes(teacher.availableTill);
        if (teacherStartMin === null || teacherEndMin === null) return false;
        return slot.start >= teacherStartMin && slot.end <= teacherEndMin;
      };

      sortedSlots.forEach((slot, slotIdx) => {
        // Prioritize classes for which this slot is their very first active slot
        const sortedRowsForSlot = [...rows].sort((a, b) => {
          const aSlots = classSlotsMap[a.classId] || [];
          const bSlots = classSlotsMap[b.classId] || [];
          const aIsStart = aSlots.length > 0 && aSlots[0].label === slot.label;
          const bIsStart = bSlots.length > 0 && bSlots[0].label === slot.label;
          if (aIsStart && !bIsStart) return -1;
          if (!aIsStart && bIsStart) return 1;
          return 0;
        });

        sortedRowsForSlot.forEach((row) => {
          const activeSlots = classSlotsMap[row.classId] || [];
          const isActive = activeSlots.some((s) => s.label === slot.label);

          if (!isActive) {
            row.cells[slotIdx] = { subject: "-", teacher: "", type: "empty" };
          } else {
            const candidates = safeTeachers.filter((t) => {
              const teachesThisClass = (t.allowedClasses || []).includes(row.className);
              const availableInTime = isTeacherAvailableForSlot(t, slot);
              const notBusy = !busyTeachersPerSlot[slot.label].has(t.id);
              return teachesThisClass && availableInTime && notBusy;
            });

            if (candidates.length > 0) {
              const chosenTeacher = candidates[Math.floor(Math.random() * candidates.length)];
              const subject = chosenTeacher.secondSubject && Math.random() > 0.5 
                ? chosenTeacher.secondSubject 
                : chosenTeacher.subject;

              row.cells[slotIdx] = { subject, teacher: chosenTeacher.name, type: "lecture" };
              busyTeachersPerSlot[slot.label].add(chosenTeacher.id);
            } else {
              row.cells[slotIdx] = { subject: "-", teacher: "", type: "empty" };
            }
          }
        });
      });

      const generatedTimetable = { timeSlots: sortedSlots, rows };
      setTimetable(generatedTimetable);
      localStorage.setItem("leaps_timetable", JSON.stringify(generatedTimetable));
      saveData({
        timetable: generatedTimetable
      });
      setActiveTab("preview");
    } catch (err) {
      console.error("Generate timetable error:", err);
      setError("Unable to generate timetable. Please check class times and teacher availability.");
    }
  };

  // --- MANUAL EDITING ---
  const handleCellEdit = (rowIndex, cellIdx, field, value) => {
    try {
      const updatedRows = [...(timetable.rows || [])];
      if (updatedRows[rowIndex]) {
        const updatedCells = [...(updatedRows[rowIndex].cells || [])];
        if (!updatedCells[cellIdx]) {
          updatedCells[cellIdx] = { subject: "-", teacher: "", type: "empty" };
        }
        updatedCells[cellIdx] = {
          ...updatedCells[cellIdx],
          [field]: value,
          type: updatedCells[cellIdx].type === "empty" && value !== "-" ? "lecture" : updatedCells[cellIdx].type
        };
        updatedRows[rowIndex] = { ...updatedRows[rowIndex], cells: updatedCells };
        
        const updatedTimetable = { ...timetable, rows: updatedRows };
        setTimetable(updatedTimetable);
        saveData({ timetable: updatedTimetable });
      }
    } catch (e) {
      console.error("handleCellEdit error:", e);
    }
  };

  const toggleTestCell = (rowIndex, cellIdx) => {
    try {
      const updatedRows = [...(timetable.rows || [])];
      if (updatedRows[rowIndex]) {
        const updatedCells = [...(updatedRows[rowIndex].cells || [])];
        const currentCell = updatedCells[cellIdx] || { subject: "-", teacher: "", type: "empty" };
        
        if (currentCell.type === "test") {
          updatedCells[cellIdx] = { subject: "Subject", teacher: "Teacher", type: "lecture" };
        } else {
          updatedCells[cellIdx] = { subject: "TEST", teacher: "", type: "test" };
        }
        updatedRows[rowIndex] = { ...updatedRows[rowIndex], cells: updatedCells };

        const updatedTimetable = { ...timetable, rows: updatedRows };
        setTimetable(updatedTimetable);
        saveData({ timetable: updatedTimetable });
      }
    } catch (e) {
      console.error("toggleTestCell error:", e);
    }
  };

  const handleClearCell = (rowIndex, cellIdx) => {
    try {
      const updatedRows = [...(timetable.rows || [])];
      if (updatedRows[rowIndex]) {
        const updatedCells = [...(updatedRows[rowIndex].cells || [])];
        updatedCells[cellIdx] = { subject: "-", teacher: "", type: "empty" };
        updatedRows[rowIndex] = { ...updatedRows[rowIndex], cells: updatedCells };

        const updatedTimetable = { ...timetable, rows: updatedRows };
        setTimetable(updatedTimetable);
        saveData({ timetable: updatedTimetable });
      }
    } catch (e) {
      console.error("handleClearCell error:", e);
    }
  };

  const handleClassNameChange = (rowIndex, newName) => {
    try {
      const updatedRows = [...(timetable.rows || [])];
      if (updatedRows[rowIndex]) {
        updatedRows[rowIndex] = { ...updatedRows[rowIndex], className: newName };
        const classId = updatedRows[rowIndex].classId;
        
        const updatedClasses = (classes || []).map((c) => (c.id === classId ? { ...c, name: newName } : c));
        setClasses(updatedClasses);

        const updatedTimetable = { ...timetable, rows: updatedRows };
        setTimetable(updatedTimetable);
        saveData({ classes: updatedClasses, timetable: updatedTimetable });
      }
    } catch (e) {
      console.error("handleClassNameChange error:", e);
    }
  };

  const handleSlotNameChange = (index, newValue) => {
    try {
      const updatedSlots = [...(timetable.timeSlots || [])];
      if (updatedSlots[index]) {
        updatedSlots[index] = { ...updatedSlots[index], label: newValue };
        
        const updatedTimetable = { ...timetable, timeSlots: updatedSlots };
        setTimetable(updatedTimetable);
        saveData({ timetable: updatedTimetable });
      }
    } catch (e) {
      console.error("handleSlotNameChange error:", e);
    }
  };

  const handleAddClassRow = () => {
    try {
      const newId = `class-${Date.now()}`;
      const newName = `Class ${(classes || []).length + 1}`;
      const updatedClasses = [...(classes || []), { id: newId, name: newName, startTime: "16:00", endTime: "20:30" }];
      setClasses(updatedClasses);

      const updatedRows = [...(timetable.rows || [])];
      const newCells = (timetable.timeSlots || []).map(() => ({ subject: "-", teacher: "", type: "empty" }));
      updatedRows.push({
        classId: newId,
        className: newName,
        cells: newCells
      });

      const updatedTimetable = { ...timetable, rows: updatedRows };
      setTimetable(updatedTimetable);
      saveData({ classes: updatedClasses, timetable: updatedTimetable });
    } catch (e) {
      console.error("handleAddClassRow error:", e);
    }
  };

  const handleRemoveClassRow = (rowIndex) => {
    try {
      if (window.confirm("Remove this class row?")) {
        const targetRow = (timetable.rows || [])[rowIndex];
        const updatedClasses = (classes || []).filter((c) => c.id !== targetRow.classId);
        setClasses(updatedClasses);

        const updatedRows = (timetable.rows || []).filter((_, idx) => idx !== rowIndex);
        const updatedTimetable = { ...timetable, rows: updatedRows };
        setTimetable(updatedTimetable);
        saveData({ classes: updatedClasses, timetable: updatedTimetable });
      }
    } catch (e) {
      console.error("handleRemoveClassRow error:", e);
    }
  };

  const handleAddTimeSlot = () => {
    try {
      const newLabel = "08:30 PM–09:00 PM";
      const start = parseTimeToMinutes("20:30");
      const end = parseTimeToMinutes("21:00");
      const updatedSlots = [...(timetable.timeSlots || []), { label: newLabel, start, end }];

      const updatedRows = (timetable.rows || []).map((row) => ({
        ...row,
        cells: [...(row.cells || []), { subject: "-", teacher: "", type: "empty" }]
      }));

      const updatedTimetable = { timeSlots: updatedSlots, rows: updatedRows };
      setTimetable(updatedTimetable);
      saveData({ timetable: updatedTimetable });
    } catch (e) {
      console.error("handleAddTimeSlot error:", e);
    }
  };

  const handleRemoveTimeSlot = (slotIndex) => {
    try {
      if (window.confirm("Remove this time slot column?")) {
        const updatedSlots = (timetable.timeSlots || []).filter((_, idx) => idx !== slotIndex);
        const updatedRows = (timetable.rows || []).map((row) => {
          const updatedCells = (row.cells || []).filter((_, idx) => idx !== slotIndex);
          return { ...row, cells: updatedCells };
        });

        const updatedTimetable = { timeSlots: updatedSlots, rows: updatedRows };
        setTimetable(updatedTimetable);
        saveData({ timetable: updatedTimetable });
      }
    } catch (e) {
      console.error("handleRemoveTimeSlot error:", e);
    }
  };

  // --- EXPORT FUNCTIONS ---
  const downloadPDF = async () => {
    const element = document.getElementById("timetable-export");
    if (!element) {
      alert("Please generate timetable first.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true
    });

    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
    pdf.save("LEAPS_Academy_Timetable.pdf");
  };

  const downloadJPG = async () => {
    const element = document.getElementById("timetable-export");
    if (!element) {
      alert("Please generate timetable first.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      scrollX: 0,
      scrollY: 0
    });

    const link = document.createElement("a");
    link.download = "LEAPS_Academy_Timetable.jpg";
    link.href = canvas.toDataURL("image/jpeg", 1.0);
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* HEADER BAR */}
      <header className="bg-stone-900 text-white shadow-xl no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-stone-950 font-extrabold w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md font-serif">
              L
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-100">
                {academyName}
              </h1>
              <p className="text-xs text-stone-400">Academy Time Table Maker</p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {[
              { id: "academy", label: "Academy Setup" },
              { id: "classes", label: "Classes" },
              { id: "teachers", label: "Teachers" },
              { id: "generate", label: "Generate" },
              { id: "preview", label: "Preview & Export" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-amber-50 text-stone-950 shadow-md transform -translate-y-0.5"
                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleResetAll}
            className="px-4 py-2 border border-stone-700 hover:border-red-500 hover:bg-red-950/30 text-stone-400 hover:text-red-400 rounded-lg text-xs font-semibold transition-all duration-300"
          >
            Reset All Data
          </button>
        </div>
      </header>

      {/* ERROR BANNER BOX */}
      {error && (
        <div className="no-print bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-7xl w-full mx-auto mt-4 rounded-r shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <p className="text-sm font-bold">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* WIZARD CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 no-print">
        {/* Step 1: Academy Setup */}
        {activeTab === "academy" && (
          <div className="glass-panel p-6 shadow-md max-w-2xl mx-auto border border-stone-200">
            <h2 className="text-2xl font-bold mb-6 text-stone-900 border-b border-stone-200 pb-3 font-serif">
              Step 1: Academy Setup
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Academy Name
                </label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => {
                    setAcademyName(e.target.value);
                    saveData({ academyName: e.target.value });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Enter Academy Name..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Heading Text
                </label>
                <input
                  type="text"
                  value={headingText}
                  onChange={(e) => {
                    setHeadingText(e.target.value);
                    saveData({ headingText: e.target.value });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Time Table"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Upload Logo
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    id="logo-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-stone-850 hover:bg-stone-800 text-stone-200 font-bold px-4 py-2.5 border border-stone-300 hover:border-amber-500 rounded-lg text-sm transition-all shadow-sm"
                  >
                    Select Image
                  </label>
                  {logo ? (
                    <div className="relative w-16 h-16 rounded border border-stone-300 overflow-hidden bg-stone-100 flex items-center justify-center">
                      <img src={logo} alt="Academy Logo" className="object-contain max-w-full max-h-full" />
                      <button
                        onClick={() => {
                          setLogo("");
                          saveData({ logo: "" });
                        }}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 text-2xs hover:bg-red-700"
                        title="Remove Logo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500 italic">No logo uploaded. Standard crest will display.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Footer Code / Version Text
                </label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => {
                    setFooterText(e.target.value);
                    saveData({ footerText: e.target.value });
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="LA25092025 V 1.1"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setActiveTab("classes")}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all uppercase tracking-wider"
                >
                  Continue to Classes Setup →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Classes Setup */}
        {activeTab === "classes" && (
          <div className="glass-panel p-6 shadow-md max-w-4xl mx-auto border border-stone-200">
            <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-3">
              <h2 className="text-2xl font-bold text-stone-900 font-serif">
                Step 2: Classes Setup
              </h2>
              <button
                onClick={() => {
                  const num = prompt("How many classes would you like to have?", (classes || []).length);
                  if (num !== null) {
                    const parsedNum = parseInt(num);
                    if (!isNaN(parsedNum) && parsedNum > 0) {
                      const updated = [...(classes || [])];
                      if (parsedNum > updated.length) {
                        for (let i = updated.length; i < parsedNum; i++) {
                          updated.push({
                            id: `class-${Date.now()}-${i}`,
                            name: `${i + 9}th`,
                            startTime: "16:00",
                            endTime: "20:30"
                          });
                        }
                      } else {
                        updated.splice(parsedNum);
                      }
                      setClasses(updated);
                      saveData({ classes: updated });
                    }
                  }
                }}
                className="text-xs font-semibold px-3 py-1.5 border border-stone-400 hover:border-amber-500 text-stone-700 hover:text-stone-900 rounded transition-all"
              >
                Set Class Count
              </button>
            </div>

            <div className="space-y-4">
              {(classes || []).map((c, index) => (
                <div
                  key={c.id}
                  className="flex flex-col md:flex-row items-center gap-4 bg-white/50 p-4 border border-stone-200 rounded-lg shadow-sm"
                >
                  <div className="w-full md:w-1/3">
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                      Class {index + 1} Name
                    </label>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const updated = classes.map((item) =>
                          item.id === c.id ? { ...item, name: e.target.value } : item
                        );
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-955 text-sm font-semibold"
                      placeholder="e.g. 9th"
                    />
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                      Starting Time
                    </label>
                    <input
                      type="time"
                      value={c.startTime}
                      onChange={(e) => {
                        const updated = classes.map((item) =>
                          item.id === c.id ? { ...item, startTime: e.target.value } : item
                        );
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-955 text-sm"
                    />
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                      Ending Time
                    </label>
                    <input
                      type="time"
                      value={c.endTime}
                      onChange={(e) => {
                        const updated = classes.map((item) =>
                          item.id === c.id ? { ...item, endTime: e.target.value } : item
                        );
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-955 text-sm"
                    />
                  </div>

                  <div className="flex items-end justify-end h-full pt-4 md:pt-0">
                    <button
                      onClick={() => {
                        const updated = classes.filter((item) => item.id !== c.id);
                        setClasses(updated);
                        saveData({ classes: updated });
                      }}
                      className="text-red-500 hover:text-red-655 p-2 hover:bg-red-50 rounded transition-all text-sm font-semibold"
                      title="Delete Class"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    const newId = `class-${Date.now()}`;
                    const updated = [...(classes || []), { id: newId, name: `Class ${(classes || []).length + 1}`, startTime: "16:00", endTime: "20:30" }];
                    setClasses(updated);
                    saveData({ classes: updated });
                  }}
                  className="px-4 py-2 border border-stone-400 hover:border-stone-900 text-stone-700 hover:text-stone-955 rounded-lg text-sm font-bold transition-all"
                >
                  + Add Another Class
                </button>

                <button
                  onClick={() => {
                    setActiveTab("teachers");
                    setError("");
                  }}
                  className="flex-grow bg-stone-900 hover:bg-stone-850 text-white font-bold py-2 rounded-lg text-sm transition-all"
                >
                  Continue to Teachers Setup →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Teachers Setup */}
        {activeTab === "teachers" && (
          <div className="glass-panel p-6 shadow-md max-w-4xl mx-auto border border-stone-200">
            <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-3">
              <h2 className="text-2xl font-bold text-stone-900 font-serif">
                Step 3: Teachers Setup
              </h2>
              <button
                onClick={() => {
                  const num = prompt("How many teachers would you like to configure?", (teachers || []).length);
                  if (num !== null) {
                    const parsedNum = parseInt(num);
                    if (!isNaN(parsedNum) && parsedNum > 0) {
                      const updated = [...(teachers || [])];
                      if (parsedNum > updated.length) {
                        for (let i = updated.length; i < parsedNum; i++) {
                          updated.push({
                            id: `teacher-${Date.now()}-${i}`,
                            name: `Teacher ${i + 1}`,
                            subject: "Subject",
                            secondSubject: "",
                            availableFrom: "16:00",
                            availableTill: "20:30",
                            allowedClasses: (classes || []).map((c) => c.name)
                          });
                        }
                      } else {
                        updated.splice(parsedNum);
                      }
                      setTeachers(updated);
                      saveData({ teachers: updated });
                    }
                  }
                }}
                className="text-xs font-semibold px-3 py-1.5 border border-stone-400 hover:border-amber-500 text-stone-700 hover:text-stone-955 rounded transition-all"
              >
                Set Teacher Count
              </button>
            </div>

            <div className="space-y-6">
              {(teachers || []).map((t, index) => (
                <div
                  key={t.id}
                  className="bg-white/60 p-5 border border-stone-200 rounded-xl shadow-sm space-y-4 relative"
                >
                  <button
                    onClick={() => {
                      const updated = teachers.filter((item) => item.id !== t.id);
                      setTeachers(updated);
                      saveData({ teachers: updated });
                    }}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-755 hover:bg-red-50 px-2 py-1 rounded text-xs font-semibold transition-all"
                  >
                    Delete Teacher
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Teacher {index + 1} Name
                      </label>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, name: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm font-semibold"
                        placeholder="Sir Imran"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Main Subject
                      </label>
                      <input
                        type="text"
                        value={t.subject}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, subject: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                        placeholder="Islamiyat"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Second Subject (Optional)
                      </label>
                      <input
                        type="text"
                        value={t.secondSubject || ""}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, secondSubject: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                        placeholder="T. Quran"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Availability Start
                      </label>
                      <input
                        type="time"
                        value={t.availableFrom}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, availableFrom: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold uppercase text-stone-500 mb-1">
                        Availability Till
                      </label>
                      <input
                        type="time"
                        value={t.availableTill}
                        onChange={(e) => {
                          const updated = teachers.map((item) =>
                            item.id === t.id ? { ...item, availableTill: e.target.value } : item
                          );
                          setTeachers(updated);
                          saveData({ teachers: updated });
                        }}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-stone-900 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase text-stone-500 mb-2">
                      Classes Teacher Can Teach
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {(classes || []).map((cls) => {
                        const isChecked = (t.allowedClasses || []).includes(cls.name);
                        return (
                          <label
                            key={cls.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                              isChecked
                                ? "bg-amber-50 border-amber-500 text-amber-950 font-semibold"
                                : "bg-white border-stone-300 text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const allowed = t.allowedClasses || [];
                                const newClasses = e.target.checked
                                  ? [...allowed, cls.name]
                                  : allowed.filter((name) => name !== cls.name);

                                const updated = teachers.map((item) =>
                                  item.id === t.id ? { ...item, allowedClasses: newClasses } : item
                                );
                                setTeachers(updated);
                                saveData({ teachers: updated });
                              }}
                              className="accent-amber-500 rounded cursor-pointer"
                            />
                            {cls.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    const newId = `teacher-${Date.now()}`;
                    const updated = [
                      ...(teachers || []),
                      {
                        id: newId,
                        name: `Teacher ${(teachers || []).length + 1}`,
                        subject: "Subject",
                        secondSubject: "",
                        availableFrom: "16:00",
                        availableTill: "20:30",
                        allowedClasses: (classes || []).map((c) => c.name)
                      }
                    ];
                    setTeachers(updated);
                    saveData({ teachers: updated });
                  }}
                  className="px-4 py-2 border border-stone-400 hover:border-stone-900 text-stone-700 hover:text-stone-950 rounded-lg text-sm font-bold transition-all"
                >
                  + Add Another Teacher
                </button>

                <button
                  onClick={() => {
                    setActiveTab("generate");
                    setError("");
                  }}
                  className="flex-grow bg-stone-900 hover:bg-stone-850 text-white font-bold py-2 rounded-lg text-sm transition-all"
                >
                  Continue to Timetable Generation →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Generate Timetable */}
        {activeTab === "generate" && (
          <div className="glass-panel p-8 shadow-md max-w-xl mx-auto border border-stone-200 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-stone-955 font-serif">
              Generate Academic Timetable
            </h2>

            <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
              Our automated engine will allocate teachers based on availability, preferred subjects, active slots per class, and strict anti-collision algorithms.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left text-xs text-stone-600 space-y-2">
              <span className="font-bold text-stone-800 uppercase tracking-wider block mb-1">Strict Rules Engine:</span>
              <div className="flex gap-2">✓ <p>Each lecture is strictly 30 minutes long.</p></div>
              <div className="flex gap-2">✓ <p>No teacher is ever double-booked at the same time slot.</p></div>
              <div className="flex gap-2">✓ <p>Teachers are only scheduled during their available hours.</p></div>
              <div className="flex gap-2">✓ <p>Teachers only cover their permitted classes.</p></div>
            </div>

            <button
              onClick={generateTimetable}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-955 font-extrabold py-3.5 rounded-lg text-sm shadow-md transition-all tracking-wider uppercase"
            >
              Generate Timetable Now
            </button>
          </div>
        )}

        {/* Step 5 & 6: Interactive Live A4 Preview & Edit Tab */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            {(!timetable || !timetable.timeSlots || timetable.timeSlots.length === 0 || !timetable.rows || timetable.rows.length === 0) ? (
              <div className="glass-panel p-12 text-center max-w-lg mx-auto border border-stone-200 space-y-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-serif">Please generate timetable first.</h3>
                <p className="text-stone-500 text-xs">
                  Configure classes and teachers, then click the Generate tab to create your master timetable.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("generate");
                    setError("");
                  }}
                  className="bg-stone-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-stone-800 transition-all"
                >
                  Go to Generate Tab
                </button>
              </div>
            ) : (
              <>
                {/* Control panel and downloads */}
                <div className="glass-panel p-6 shadow-md border border-stone-200 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-955 font-serif">
                      A4 Landscape Live Editor & Exports
                    </h2>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Click on any text (headings, class names, timeslot headers, subjects, or teacher names) inside the A4 layout below to modify them instantly.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={downloadJPG}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-955 font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-sm"
                    >
                      Download JPG
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-sm"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={handlePrint}
                      className="border border-stone-400 hover:border-stone-950 hover:bg-stone-50 text-stone-700 hover:text-stone-955 font-bold px-4 py-2.5 rounded-lg text-xs transition-all"
                    >
                      Print View
                    </button>
                  </div>
                </div>

                <div className="glass-panel p-4 border border-stone-200 flex flex-wrap gap-3 items-center text-xs">
                  <span className="font-bold text-stone-800 uppercase tracking-wider">Layout Controls:</span>
                  <button
                    onClick={handleAddClassRow}
                    className="bg-white border border-stone-300 hover:border-amber-500 text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded transition-all font-semibold"
                  >
                    + Add Class Row
                  </button>
                  <button
                    onClick={handleAddTimeSlot}
                    className="bg-white border border-stone-300 hover:border-amber-500 text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded transition-all font-semibold"
                  >
                    + Add Time Slot Column
                  </button>
                </div>

                {/* PREVIEW CONTAINER - FULL REAL WYSIWYG A4 PAGE */}
                <div className="flex justify-center overflow-x-auto py-6 bg-stone-200 border border-stone-300 rounded-xl shadow-inner">
                  <div className="shadow-2xl border border-stone-300 bg-white p-1">
                    {/* Timetable Export Container */}
                    <div
                      id="timetable-export"
                      ref={previewRef}
                      className="export-page"
                    >
                      {/* Export Header */}
                      <div className="export-header">
                        <div className="flex items-center justify-start">
                          {logo ? (
                            <img src={logo} alt="Crest Logo" className="export-logo" />
                          ) : (
                            <div className="w-14 h-14 border border-stone-955 rounded-full flex flex-col items-center justify-center text-center p-0.5 bg-white">
                              <div className="border border-stone-955 rounded-full w-full h-full flex flex-col items-center justify-center">
                                <span className="text-4xs font-bold leading-none text-black">LEAPS</span>
                                <span className="text-5xs font-serif leading-none mt-0.5 text-black">ACADEMY</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Heading Titles */}
                        <div className="export-title">
                          <h1 className="uppercase font-bold text-black select-none">
                            {academyName}
                          </h1>
                          <h2 className="uppercase font-bold text-black select-none">
                            {headingText}
                          </h2>
                        </div>
                        <div className="w-20"></div>
                      </div>

                      {/* Timetable wrapper container */}
                      <div className="export-table-wrapper">
                        <table className="export-table">
                          <colgroup>
                            <col style={{ width: "130px" }} />
                            {timetable.timeSlots.map((slot, index) => (
                              <col key={index} />
                            ))}
                          </colgroup>

                          <thead>
                            <tr>
                              <th className="export-class-col">Class / Time</th>
                              {timetable.timeSlots.map((slot, index) => (
                                <th key={index}>{slot.label || slot}</th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {timetable.rows.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                <td className="export-class-col">{row.className}</td>
                                {timetable.timeSlots.map((slot, cellIndex) => {
                                  const cell = row.cells?.[cellIndex] || { subject: "-", teacher: "", type: "empty" };

                                  return (
                                    <td key={cellIndex}>
                                      {cell.type === "test" ? (
                                        <span className="export-test-cell">TEST</span>
                                      ) : (
                                        <>
                                          <span className="export-subject">{cell.subject || "-"}</span>
                                          {cell.teacher && <span className="export-teacher">{cell.teacher}</span>}
                                        </>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Absolute Footer */}
                      <div className="export-footer font-serif">
                        <div className="font-bold text-black select-none">
                          {footerText}
                        </div>
                        <div className="italic text-stone-950 select-none">LEAPS Academy Time Table Maker v1.1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* --- HIDDEN ABSOLUTE PRINT CONTAINER (ONLY VISIBLE ON PRINT EVENT) --- */}
      {timetable && timetable.timeSlots && timetable.timeSlots.length > 0 && timetable.rows && timetable.rows.length > 0 && (
        <div className="hidden print:block absolute top-0 left-0 bg-white">
          <div
            className="export-page"
            style={{
              fontFamily: "'Playfair Display', serif"
            }}
          >
            <div className="export-header">
              <div className="flex items-center justify-start">
                {logo ? (
                  <img src={logo} alt="Crest Logo" className="export-logo" />
                ) : (
                  <div className="w-14 h-14 border border-stone-955 rounded-full flex flex-col items-center justify-center text-center p-0.5 bg-white">
                    <div className="border border-stone-955 rounded-full w-full h-full flex flex-col items-center justify-center">
                      <span className="text-4xs font-bold leading-none text-black">LEAPS</span>
                      <span className="text-5xs font-serif leading-none mt-0.5 text-black">ACADEMY</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="export-title">
                <h1>{academyName}</h1>
                <h2>{headingText}</h2>
              </div>
              <div className="w-20"></div>
            </div>

            <div className="export-table-wrapper">
              <table className="export-table">
                <colgroup>
                  <col style={{ width: "130px" }} />
                  {timetable.timeSlots.map((slot, index) => (
                    <col key={index} />
                  ))}
                </colgroup>

                <thead>
                  <tr>
                    <th className="export-class-col">Class / Time</th>
                    {timetable.timeSlots.map((slot, index) => (
                      <th key={index}>{slot.label || slot}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {timetable.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="export-class-col">{row.className}</td>
                      {timetable.timeSlots.map((slot, cellIndex) => {
                        const cell = row.cells?.[cellIndex] || { subject: "-", teacher: "", type: "empty" };

                        return (
                          <td key={cellIndex}>
                            {cell.type === "test" ? (
                              <span className="export-test-cell">TEST</span>
                            ) : (
                              <>
                                <span className="export-subject">{cell.subject || "-"}</span>
                                {cell.teacher && <span className="export-teacher">{cell.teacher}</span>}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="export-footer">
              <span>{footerText}</span>
              <span className="italic">LEAPS Academy Time Table Maker v1.1</span>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="bg-stone-900 text-stone-500 py-6 border-t border-stone-850 text-center text-xs no-print">
        <p>© 2026 LEAPS Academy Time Table Maker. Built with Next.js, Tailwind CSS and jsPDF.</p>
      </footer>
    </div>
  );
}
