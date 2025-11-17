import { useEffect, useState } from "react";
import { getRequiredClass } from "../../services/getRequiredClass";

export const useClassChain = (selectedClassId) => {
  const [classChain, setClassChain] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!selectedClassId) return;
      
      const first = await getRequiredClass(selectedClassId);
      if (!first) {
        setClassChain([]);
        return;
      }

      const chain = [first];

      // Si abre otra clase, cargarla:
      if (first.fc_open_class_id) {
        const second = await getRequiredClass(first.fc_open_class_id);
        if (second) chain.push(second);
      }

      setClassChain(chain);
    };

    load();
  }, [selectedClassId]);

  return classChain;
};
