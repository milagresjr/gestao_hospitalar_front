"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui_old/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import api from "@/services/api";
import { getPacientes } from "@/services/paciente";
import { getTipoConsultas } from "@/services/consultas";
import { getProfissionalSaude } from "@/services/profissional-saude";

export const EcommerceMetrics = () => {

  const [pacientes,setPacientes] = useState();
  const [profissionalSaude,setProfissionalSaude] = useState();
  const [consultasMarcada,setConsultasMarcada] = useState([]);
  const [consultasNaHora,setConsultasNaHora] = useState([]);

  useEffect(() => {
    async function pegarPacientes() {
      try {
        const response = await getPacientes();
        setPacientes(response);
      } catch (error) {
        console.log("Erro ao pegar os clientes",error);
      }
    }

    async function pegarProfissionalSaude() {
      try {
        const response = await getProfissionalSaude();
        setProfissionalSaude(response);
      } catch (error) {
        console.log("Erro ao pegar os clientes",error);
      }
    }


    async function pegarConsultasMarcadas() {
      try {
        const response = await getTipoConsultas('marcada');
        setConsultasMarcada(response);
      } catch (error) {
        console.log("Erro ao pegar os clientes",error);
      }
    }

    async function pegarConsultasNaHora() {
      try {
        const response = await getTipoConsultas('na_hora');
        setConsultasNaHora(response);
      } catch (error) {
        console.log("Erro ao pegar os clientes",error);
      }
    }

    pegarPacientes();
    pegarProfissionalSaude();
    pegarConsultasMarcadas();
    pegarConsultasNaHora();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pacientes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pacientes?.total}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Profissionais de saúde
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {profissionalSaude?.total}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Consultas Marcadas
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {consultasMarcada?.length}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Consultas Realizadas
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {consultasNaHora?.length}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

    </div>
  );
};
