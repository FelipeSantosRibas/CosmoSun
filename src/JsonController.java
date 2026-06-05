import com.google.gson.*;

import java.util.ArrayList;

public class JsonController {
    public static double extrairIrradiacaoCidade(String json){
        JsonObject root = JsonParser.parseString(json).getAsJsonObject();

        double irradiacaoAnual = root
                .getAsJsonObject("properties")
                .getAsJsonObject("parameter")
                .getAsJsonObject("ALLSKY_SFC_SW_DWN")
                .get("ANN")
                .getAsDouble();

        return irradiacaoAnual;
    }

    public static String cidadesParaJson(ArrayList<Cidade> cidadesComIrradiacao){
        Gson gson = new GsonBuilder().setPrettyPrinting().create();

        JsonArray array = new JsonArray();

        for (Cidade cidade : cidadesComIrradiacao) {
            JsonObject obj = new JsonObject();

            obj.addProperty("nome", cidade.getNome());
            obj.addProperty("irradiacao", cidade.getIrradiacao());

            array.add(obj);
        }

        return gson.toJson(array);
    }
}
