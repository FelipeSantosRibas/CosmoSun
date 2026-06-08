import com.google.gson.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

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

    public static void gerarJsonSeparados(ArrayList<Cidade> cidadesComIrradiacao) {

        Map<String, Object> dados = new LinkedHashMap<>();

        ArrayList<String> nomes = new ArrayList<>();
        ArrayList<Double> irradiacoes = new ArrayList<>();
        ArrayList<Double> longitudes = new ArrayList<>();
        ArrayList<Double> latitudes = new ArrayList<>();

        for (Cidade c : cidadesComIrradiacao) {
            nomes.add(c.getNome());
            irradiacoes.add(c.getIrradiacao());
            longitudes.add(c.getLongitude());
            latitudes.add(c.getLatitude());
        }

        dados.put("nomes", nomes);
        dados.put("irradiacoes", irradiacoes);
        dados.put("longitudes", longitudes);
        dados.put("latitudes", latitudes);

        Gson gson = new GsonBuilder()
                .setPrettyPrinting()
                .create();

        System.out.println(gson.toJson(dados));
    }
}
