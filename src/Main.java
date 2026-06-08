import java.util.ArrayList;

public class Main {

    public static void main(String[] args) {
        ArrayList<Cidade> cidades = new ArrayList<>();

        cidades.add(new Cidade("São Paulo", -46.633308, -23.550520));
        cidades.add(new Cidade("Brasília", -47.882778, -15.793889));
        cidades.add(new Cidade("Rio de Janeiro", -43.172896, -22.906847));
        cidades.add(new Cidade("Salvador", -38.501629, -12.977749));
        cidades.add(new Cidade("Fortaleza", -38.526670, -3.731862));
        cidades.add(new Cidade("Belo Horizonte", -43.938629, -19.916681));
        cidades.add(new Cidade("Curitiba", -49.273251, -25.428954));
        cidades.add(new Cidade("Recife", -34.877001, -8.047563));
        cidades.add(new Cidade("Manaus", -60.021731, -3.119028));
        cidades.add(new Cidade("Porto Alegre", -51.230000, -30.033056));

        cidades.add(new Cidade("Washington", -77.036871, 38.907192));
        cidades.add(new Cidade("Londres", -0.127758, 51.507351));
        cidades.add(new Cidade("Paris", 2.352222, 48.856614));
        cidades.add(new Cidade("Berlim", 13.405000, 52.520008));
        cidades.add(new Cidade("Tóquio", 139.691711, 35.689487));
        cidades.add(new Cidade("Pequim", 116.407396, 39.904200));
        cidades.add(new Cidade("Canberra", 149.130009, -35.280937));
        cidades.add(new Cidade("Ottawa", -75.697193, 45.421530));
        cidades.add(new Cidade("Moscow", 37.617300, 55.755826));
        cidades.add(new Cidade("Cairo", 31.235712, 30.044420));


        ArrayList<Cidade> cidadesComIrradiacao = new ArrayList<>();
        for (Cidade c: cidades){
            // Extrai a irradiação da cidade a partir do json requisitado pela nasa power api
            Double irradiacao = JsonController.extrairIrradiacaoCidade(NasaPowerRequest.requisitarDadosCidade(c));
            cidadesComIrradiacao.add(new Cidade(c.getNome(),c.getLongitude(),c.getLatitude(),irradiacao));
        }

        JsonController.gerarJsonSeparados(cidadesComIrradiacao);

        System.out.println(JsonController.cidadesParaJson(cidadesComIrradiacao));

    }
}